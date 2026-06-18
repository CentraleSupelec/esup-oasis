import React from "react";
import { screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import EvenementTable from "./EvenementTable";

vi.mock("@context/modals/ModalsContext", () => ({
  useModals: () => ({ setModalEvenementId: vi.fn() }),
}));

vi.mock("@controls/Table/EvenementTableExport", () => ({
  default: () => null,
}));

vi.mock("@controls/Items/EtudiantItem", () => ({
  EtudiantItem: ({ utilisateurId }: { utilisateurId: string }) => <span>{utilisateurId}</span>,
}));

vi.mock("@controls/Items/TypeEvenementItem", () => ({
  TypeEvenementItem: ({ typeEvenementId }: { typeEvenementId: string }) => (
    <span>{typeEvenementId}</span>
  ),
}));

vi.mock("@controls/Items/CampusItem", () => ({
  CampusItem: ({ campusId }: { campusId: string }) => <span>{campusId}</span>,
}));

vi.mock("@controls/Items/EvenementIconeEnvoiRhItem", () => ({
  EvenementIconeEnvoiRhItem: () => null,
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { isPlanificateur: false, uid: "test@test.fr" } }),
}));

describe("EvenementTable — accessibilité (Y1)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core (table vide)", async () => {
    const { container } = renderWithProviders(<EvenementTable events={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("les en-têtes de colonnes nommés ont un nom accessible", () => {
    renderWithProviders(<EvenementTable events={[]} />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
    const namedHeaders = headers.filter(
      (h) => (h.textContent?.trim().length ?? 0) > 0 || h.getAttribute("aria-label"),
    );
    expect(namedHeaders.length).toBeGreaterThan(0);
  });

  it("le tableau a le rôle 'table'", () => {
    renderWithProviders(<EvenementTable events={[]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
