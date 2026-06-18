import React from "react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import { makeDemande } from "@/test/fixtures";
import Demandes from "./Demandes";

const { mockUseGetFullCollection } = vi.hoisted(() => ({
  mockUseGetFullCollection: vi.fn(
    () =>
      ({ data: undefined as unknown, isFetching: false }) as {
        data: unknown;
        isFetching: boolean;
        isError?: boolean;
      },
  ),
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
    open ? <div role="dialog" aria-modal="true" aria-label="Nouvelle demande" /> : null,
}));

vi.mock("@controls/List/CampagneDemandeList", () => ({
  default: ({ demandes }: { demandes?: Array<{ "@id": string }> }) => (
    <ul aria-label="Liste de vos demandes">
      {demandes?.map((d) => (
        <li key={d["@id"]}>{d["@id"]}</li>
      ))}
    </ul>
  ),
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true, md: true }),
}));

// ─── Y15 : état vide ──────────────────────────────────────────────────────────

describe("Demandes — accessibilité, état vide (Y15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetFullCollection.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("aucune violation axe-core", async () => {
    const { container } = renderWithProviders(<Demandes />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("l'alerte d'information a un rôle accessible", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("le bouton 'Déposer une nouvelle demande' a un nom accessible", () => {
    renderWithProviders(<Demandes />);
    expect(
      screen.getByRole("button", { name: /déposer une nouvelle demande/i }),
    ).toBeInTheDocument();
  });

  it("la page contient un titre h1", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

// ─── Y21 : avec données réelles ───────────────────────────────────────────────

describe("Demandes — accessibilité avec données réelles (Y21)", () => {
  const demandes = [
    makeDemande({ etat: "/etats_demandes/1" }),
    makeDemande({ etat: "/etats_demandes/2" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetFullCollection.mockReturnValue({
      data: { items: demandes, totalItems: demandes.length },
      isFetching: false,
    });
  });

  it("aucune violation axe-core avec des demandes chargées", async () => {
    const { container } = renderWithProviders(<Demandes />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("les demandes sont rendues dans une liste accessible", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByRole("list", { name: /liste de vos demandes/i })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(demandes.length);
  });
});

// ─── Y22 : état d'erreur réseau ───────────────────────────────────────────────
// Note : Demandes n'a pas d'Alert inline en cas d'erreur API — dégradation gracieuse.

describe("Demandes — état d'erreur réseau (Y22)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simule l'état post-erreur : data=undefined, isError=true
    mockUseGetFullCollection.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: true,
    });
  });

  it("aucune violation axe-core en état d'erreur", async () => {
    const { container } = renderWithProviders(<Demandes />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("la structure de page reste valide (h1, alerte info) en état d'erreur", () => {
    renderWithProviders(<Demandes />);
    expect(screen.getByRole("heading", { level: 1, name: /demandes/i })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("le bouton 'Déposer une nouvelle demande' reste accessible en état d'erreur", () => {
    renderWithProviders(<Demandes />);
    expect(
      screen.getByRole("button", { name: /déposer une nouvelle demande/i }),
    ).toBeInTheDocument();
  });
});
