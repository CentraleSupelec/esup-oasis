import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "antd";
import UtilisateurDrawer from "./UtilisateurDrawer";
import { RoleValues } from "@lib";

// ---------------------------------------------------------------------------
// Mocks hoistés
// ---------------------------------------------------------------------------

const { mockSetDrawerUtilisateur } = vi.hoisted(() => ({
  mockSetDrawerUtilisateur: vi.fn(),
}));

const { mockMutate, mockUsePatch } = vi.hoisted(() => {
  const mutateFn = vi.fn();
  return { mockMutate: mutateFn, mockUsePatch: vi.fn(() => ({ mutate: mutateFn })) };
});

const { mockUseDrawerState } = vi.hoisted(() => ({
  mockUseDrawerState: vi.fn(() => ({
    role: undefined as RoleValues | undefined,
    utilisateur: undefined as Record<string, unknown> | undefined,
    setUtilisateur: vi.fn(),
    data: undefined as Record<string, unknown> | undefined,
    isFetching: false,
  })),
}));

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(() => ({ user: { isGestionnaire: true, isPlanificateur: true } })),
}));

vi.mock("@controls/Drawers/Utilisateur/useUtilisateurDrawerState", () => ({
  useUtilisateurDrawerState: mockUseDrawerState,
}));

vi.mock("@context/drawers/DrawersContext", () => ({
  useDrawers: () => ({
    drawers: { UTILISATEUR: undefined, UTILISATEUR_ROLE: undefined },
    setDrawerUtilisateur: mockSetDrawerUtilisateur,
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({ usePatch: mockUsePatch }),
}));

vi.mock("@controls/Spinner/Spinner", () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock("@controls/Drawers/Utilisateur/UtilisateurDrawerHeader", () => ({
  default: ({ utilisateur }: { utilisateur: { prenom?: string; nom?: string } }) => (
    <div data-testid="drawer-header">
      {utilisateur.prenom} {utilisateur.nom}
    </div>
  ),
}));

vi.mock("@controls/Drawers/Utilisateur/UtilisateurDrawerTabs", () => ({
  default: () => <div data-testid="drawer-tabs" />,
}));

// Le footer transmet isBeneficiaireSansProfil / isIntervenantSansTypeEvenement au bouton submit.
vi.mock("@controls/Drawers/Utilisateur/UtilisateurDrawerFooter", () => ({
  default: ({
    isBeneficiaireSansProfil,
    isIntervenantSansTypeEvenement,
  }: {
    isBeneficiaireSansProfil: boolean;
    isIntervenantSansTypeEvenement: boolean;
  }) => (
    <button
      type="submit"
      data-testid="save-button"
      disabled={isBeneficiaireSansProfil || isIntervenantSansTypeEvenement}
    >
      Enregistrer
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const baseUser = {
  "@id": "/utilisateurs/alice@test.fr",
  uid: "alice@test.fr",
  nom: "Doe",
  prenom: "Alice",
  email: "alice@test.fr",
  roles: [RoleValues.ROLE_BENEFICIAIRE],
  profils: ["profil/1"],
  typesEvenements: ["type/1"],
  roleCalcule: RoleValues.ROLE_BENEFICIAIRE,
};

const intervenantUser = {
  "@id": "/utilisateurs/bob@test.fr",
  uid: "bob@test.fr",
  nom: "Martin",
  prenom: "Bob",
  email: "bob@test.fr",
  roles: [RoleValues.ROLE_INTERVENANT],
  profils: [],
  typesEvenements: [],
  roleCalcule: RoleValues.ROLE_INTERVENANT,
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderDrawer(props: { id?: string; onClose?: () => void } = {}) {
  return render(
    <App>
      <UtilisateurDrawer {...props} />
    </App>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UtilisateurDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { isGestionnaire: true, isPlanificateur: true } });
    mockUseDrawerState.mockReturnValue({
      role: undefined,
      utilisateur: undefined,
      setUtilisateur: vi.fn(),
      data: undefined,
      isFetching: false,
    });
    mockUsePatch.mockReturnValue({ mutate: mockMutate });
  });

  // -----------------------------------------------------------------------
  // États de chargement / erreur
  // -----------------------------------------------------------------------

  describe("États de rendu", () => {
    it("sans data → aucun dialog, formulaire invisible rendu", () => {
      renderDrawer();
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("isFetching=true → Spinner visible, aucun dialog", () => {
      mockUseDrawerState.mockReturnValue({
        role: undefined,
        utilisateur: undefined,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: true,
      });
      renderDrawer();
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("data définie mais utilisateur undefined → Spinner affiché", () => {
      mockUseDrawerState.mockReturnValue({
        role: undefined,
        utilisateur: undefined,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      renderDrawer();
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it('role "intervenant" (chaîne legacy) → alerte d\'erreur de rôle', () => {
      mockUseDrawerState.mockReturnValue({
        role: "intervenant" as RoleValues,
        utilisateur: baseUser,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      renderDrawer();
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("utilisateur chargé → Drawer rendu avec header et tabs", async () => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: baseUser,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      renderDrawer();
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("drawer-header")).toBeInTheDocument();
      expect(screen.getByTestId("drawer-tabs")).toBeInTheDocument();
    });

    it("drawer affiche le prénom et nom de l'utilisateur", async () => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: baseUser,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      renderDrawer();
      await screen.findByRole("dialog");
      expect(screen.getByTestId("drawer-header")).toHaveTextContent("Alice Doe");
    });
  });

  // -----------------------------------------------------------------------
  // Fermeture du drawer
  // -----------------------------------------------------------------------

  describe("Fermeture", () => {
    beforeEach(() => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: baseUser,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
    });

    it("sans id prop → setDrawerUtilisateur(undefined) appelé à la fermeture", async () => {
      const user = userEvent.setup();
      renderDrawer();
      await screen.findByRole("dialog");
      const closeBtn = document.querySelector(".ant-drawer-close") as HTMLElement;
      expect(closeBtn).not.toBeNull();
      await user.click(closeBtn);
      expect(mockSetDrawerUtilisateur).toHaveBeenCalledWith(undefined);
    });

    it("avec id prop → onClose appelé, setDrawerUtilisateur NON appelé", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderDrawer({ id: "/utilisateurs/alice@test.fr", onClose });
      await screen.findByRole("dialog");
      const closeBtn = document.querySelector(".ant-drawer-close") as HTMLElement;
      await user.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
      expect(mockSetDrawerUtilisateur).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // Calcul des alertes (avertissements métier)
  // -----------------------------------------------------------------------

  describe("Alertes métier (footer)", () => {
    it("bénéficiaire sans profil → bouton Enregistrer désactivé", async () => {
      mockUseAuth.mockReturnValue({ user: { isGestionnaire: true, isPlanificateur: true } });
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: { ...baseUser, profils: [] },
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      renderDrawer();
      await screen.findByRole("dialog");
      expect(screen.getByTestId("save-button")).toBeDisabled();
    });

    it("bénéficiaire avec profil → bouton Enregistrer actif", async () => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: baseUser, // profils: ["profil/1"]
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      renderDrawer();
      await screen.findByRole("dialog");
      expect(screen.getByTestId("save-button")).not.toBeDisabled();
    });

    it("intervenant sans catégorie d'événement → bouton Enregistrer désactivé", async () => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_INTERVENANT,
        utilisateur: { ...intervenantUser, typesEvenements: [] },
        setUtilisateur: vi.fn(),
        data: intervenantUser,
        isFetching: false,
      });
      renderDrawer();
      await screen.findByRole("dialog");
      expect(screen.getByTestId("save-button")).toBeDisabled();
    });

    it("intervenant avec catégorie → bouton Enregistrer actif", async () => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_INTERVENANT,
        utilisateur: { ...intervenantUser, typesEvenements: ["type/1"] },
        setUtilisateur: vi.fn(),
        data: intervenantUser,
        isFetching: false,
      });
      renderDrawer();
      await screen.findByRole("dialog");
      expect(screen.getByTestId("save-button")).not.toBeDisabled();
    });
  });

  // -----------------------------------------------------------------------
  // Soumission du formulaire
  // -----------------------------------------------------------------------

  describe("Soumission (mutation PATCH)", () => {
    it("clic Enregistrer → mutate appelé avec l'@id de l'utilisateur", async () => {
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: baseUser,
        setUtilisateur: vi.fn(),
        data: baseUser,
        isFetching: false,
      });
      const user = userEvent.setup();
      renderDrawer();
      await screen.findByRole("dialog");
      await user.click(screen.getByTestId("save-button"));
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ "@id": "/utilisateurs/alice@test.fr" }),
      );
    });

    it("payload inclut les rôles filtrés (sans ROLE_DEMANDEUR ni ROLE_USER)", async () => {
      const utilisateurAvecRoles = {
        ...baseUser,
        roles: [RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_DEMANDEUR, "ROLE_USER"],
      };
      mockUseDrawerState.mockReturnValue({
        role: RoleValues.ROLE_BENEFICIAIRE,
        utilisateur: utilisateurAvecRoles,
        setUtilisateur: vi.fn(),
        data: utilisateurAvecRoles,
        isFetching: false,
      });
      const user = userEvent.setup();
      renderDrawer();
      await screen.findByRole("dialog");
      await user.click(screen.getByTestId("save-button"));
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roles: expect.not.arrayContaining([RoleValues.ROLE_DEMANDEUR, "ROLE_USER"]),
          }),
        }),
      );
    });
  });
});
