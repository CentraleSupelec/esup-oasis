import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import Demandes from "./Demandes";

const { mockUseGetFullCollection } = vi.hoisted(() => ({
  mockUseGetFullCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({ useGetFullCollection: mockUseGetFullCollection }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { "@id": "/utilisateurs/test@test.fr", uid: "test@test.fr" },
  }),
}));

vi.mock("@controls/Modals/Demande/NouvelleDemandeModale", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="nouvelle-demande-modale" /> : null,
}));

vi.mock("@controls/List/CampagneDemandeList", () => ({
  default: () => <div data-testid="campagne-demande-list" />,
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true, md: true }),
}));

describe("Demandes (route demandeur)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("affiche le titre 'Demandes'", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByRole("heading", { name: /demandes/i, level: 1 })).toBeInTheDocument();
  });

  it("affiche l'alerte d'information sur le service", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("affiche la liste des demandes (CampagneDemandeList)", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByTestId("campagne-demande-list")).toBeInTheDocument();
  });

  it("affiche le bouton 'Déposer une nouvelle demande'", () => {
    renderWithProviders(<Demandes />);
    expect(
      screen.getByRole("button", { name: /déposer une nouvelle demande/i }),
    ).toBeInTheDocument();
  });

  it("cliquer le bouton ouvre NouvelleDemandeModale", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Demandes />);
    expect(screen.queryByTestId("nouvelle-demande-modale")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /déposer une nouvelle demande/i }));
    expect(screen.getByTestId("nouvelle-demande-modale")).toBeInTheDocument();
  });

  it("affiche le titre de la section 'Vos demandes en cours'", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByText(/vos demandes en cours/i)).toBeInTheDocument();
  });
});
