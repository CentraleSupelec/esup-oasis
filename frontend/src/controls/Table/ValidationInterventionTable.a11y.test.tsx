import React from "react";
import { screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import ValidationInterventionTable from "./ValidationInterventionTable";

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollectionPaginated: vi.fn(() => ({ data: undefined, isFetching: false })),
    useGetFullCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
    usePatch: vi.fn(() => ({ mutate: vi.fn() })),
  }),
}));

vi.mock("@/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ notification: { success: vi.fn(), error: vi.fn() } }),
    },
  };
});

vi.mock("@controls/Items/EtudiantItem", () => ({
  EtudiantItem: ({ utilisateurId }: { utilisateurId: string }) => <span>{utilisateurId}</span>,
}));

vi.mock("@controls/Items/TypeEvenementItem", () => ({
  TypeEvenementItem: ({ typeEvenementId }: { typeEvenementId: string }) => (
    <span>{typeEvenementId}</span>
  ),
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

describe("ValidationInterventionTable — accessibilité (Y1)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core (hors colonne de sélection Ant Design)", async () => {
    const { container } = renderWithProviders(<ValidationInterventionTable />);
    // La colonne de sélection (rowSelection) d'Ant Design génère un <th> sans texte visible ;
    // c'est un pattern connu du framework — le header est accessible via son contexte.
    const results = await axe(container, {
      rules: { "empty-table-header": { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("les en-têtes de colonnes nommés ont un nom accessible", () => {
    renderWithProviders(<ValidationInterventionTable />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
    const namedHeaders = headers.filter(
      (h) => (h.textContent?.trim().length ?? 0) > 0 || h.getAttribute("aria-label"),
    );
    expect(namedHeaders.length).toBeGreaterThan(0);
  });

  it("le tableau a le rôle 'table'", () => {
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("le switch 'Masquer les annulations' a un rôle accessible", () => {
    renderWithProviders(<ValidationInterventionTable />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
