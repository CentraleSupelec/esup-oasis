import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "antd";
import UtilisateurDrawer from "./UtilisateurDrawer";
import { RoleValues } from "@lib";

vi.mock("@controls/Drawers/Utilisateur/useUtilisateurDrawerState", () => ({
  useUtilisateurDrawerState: vi.fn(() => ({
    role: RoleValues.ROLE_BENEFICIAIRE,
    utilisateur: {
      "@id": "/utilisateurs/alice@test.fr",
      uid: "alice@test.fr",
      nom: "Doe",
      prenom: "Alice",
      email: "alice@test.fr",
      roles: [RoleValues.ROLE_BENEFICIAIRE],
      profils: ["profil/1"],
      typesEvenements: ["type/1"],
      roleCalcule: RoleValues.ROLE_BENEFICIAIRE,
    },
    setUtilisateur: vi.fn(),
    data: { "@id": "/utilisateurs/alice@test.fr" },
    isFetching: false,
  })),
}));

vi.mock("@context/drawers/DrawersContext", () => ({
  useDrawers: () => ({
    drawers: { UTILISATEUR: "/utilisateurs/alice@test.fr", UTILISATEUR_ROLE: undefined },
    setDrawerUtilisateur: vi.fn(),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { isGestionnaire: true, isPlanificateur: true } }),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({ usePatch: vi.fn(() => ({ mutate: vi.fn() })) }),
}));

vi.mock("@controls/Spinner/Spinner", () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock("@controls/Drawers/Utilisateur/UtilisateurDrawerHeader", () => ({
  default: () => <div>Alice Doe</div>,
}));

vi.mock("@controls/Drawers/Utilisateur/UtilisateurDrawerTabs", () => ({
  default: () => <div data-testid="drawer-tabs" />,
}));

vi.mock("@controls/Drawers/Utilisateur/UtilisateurDrawerFooter", () => ({
  default: () => (
    <button type="submit" data-testid="save-button">
      Enregistrer
    </button>
  ),
}));

describe("UtilisateurDrawer — accessibilité (Y2)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("le drawer expose role='dialog' avec aria-modal='true'", async () => {
    render(
      <App>
        <UtilisateurDrawer />
      </App>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("le titre du dialog est non vide et visible", async () => {
    render(
      <App>
        <UtilisateurDrawer />
      </App>,
    );
    await screen.findByRole("dialog");
    expect(screen.getByText("Alice Doe")).toBeInTheDocument();
  });

  it("le bouton de fermeture est accessible", async () => {
    render(
      <App>
        <UtilisateurDrawer />
      </App>,
    );
    await screen.findByRole("dialog");
    const closeBtn = document.querySelector(".ant-drawer-close");
    expect(closeBtn).not.toBeNull();
    // Le bouton de fermeture Ant Design porte un aria-label ou est un bouton accessible
    expect(closeBtn?.tagName.toLowerCase()).toBe("button");
  });

  it("aucune violation axe-core (drawer ouvert)", async () => {
    render(
      <App>
        <UtilisateurDrawer />
      </App>,
    );
    await screen.findByRole("dialog");
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
