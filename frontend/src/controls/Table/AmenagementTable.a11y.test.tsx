import React from "react";
import { screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import { AmenagementTable } from "./AmenagementTable";
import { FiltreAmenagement } from "./AmenagementTableLayout";

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
    useGetFullCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { isGestionnaire: false, isRenfort: false, uid: "test@test.fr" },
  }),
}));

vi.mock("@controls/Table/AmenagementTableColumns", () => ({
  amenagementTableColumns: () => [
    { title: "Bénéficiaire", dataIndex: "beneficiaire", key: "beneficiaire" },
    { title: "Type aménagement", dataIndex: "typeAmenagement", key: "typeAmenagement" },
  ],
}));

vi.mock("@controls/Modals/ModalAmenagement", () => ({
  ModalAmenagement: () => null,
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true }),
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

const FILTRE_DEFAULT: FiltreAmenagement = {
  page: 1,
  itemsPerPage: 25,
  "order[beneficiaires.utilisateur.nom]": "asc",
  restreindreColonnes: false,
};

describe("AmenagementTable — accessibilité (Y1)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core (table vide)", async () => {
    const { container } = renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("les en-têtes de colonnes nommés ont un nom accessible", () => {
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
    const namedHeaders = headers.filter((h) => (h.textContent?.trim().length ?? 0) > 0);
    expect(namedHeaders.length).toBeGreaterThan(0);
  });

  it("le tableau a le rôle 'table'", () => {
    renderWithProviders(
      <AmenagementTable filtreAmenagement={FILTRE_DEFAULT} setFiltreAmenagement={vi.fn()} />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
