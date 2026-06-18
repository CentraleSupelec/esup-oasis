import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UtilisateurCreerDrawer from "./UtilisateurCreerDrawer";
import { RoleValues } from "@lib";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockUseGetCollectionPaginated } = vi.hoisted(() => ({
  mockUseGetCollectionPaginated: vi.fn(({ enabled }: { enabled: boolean }) =>
    enabled
      ? {
          data: undefined as { items: unknown[]; totalItems: number } | undefined,
          isFetching: false,
        }
      : { data: undefined, isFetching: false },
  ),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollectionPaginated: mockUseGetCollectionPaginated,
  }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const user1 = {
  "@id": "/utilisateurs/alice@test.fr",
  uid: "alice@test.fr",
  nom: "DUPONT",
  prenom: "Alice",
  email: "alice@test.fr",
  roles: [],
};

const defaultProps = {
  type: RoleValues.ROLE_INTERVENANT,
  open: true,
  setOpen: vi.fn(),
  onChange: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UtilisateurCreerDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Par défaut : enabled=false → pas de données (formulaire de recherche visible)
    mockUseGetCollectionPaginated.mockImplementation(({ enabled }: { enabled: boolean }) => ({
      data: enabled ? undefined : undefined,
      isFetching: false,
    }));
  });

  describe("Ouverture et titre", () => {
    it("open=true → drawer visible", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("titre reflète le rôle INTERVENANT", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} type={RoleValues.ROLE_INTERVENANT} />);
      await screen.findByRole("dialog");
      expect(screen.getByText(/intervenant/i)).toBeInTheDocument();
    });

    it("titre reflète le rôle BENEFICIAIRE", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} type={RoleValues.ROLE_BENEFICIAIRE} />);
      await screen.findByRole("dialog");
      expect(screen.getByText(/bénéficiaire/i)).toBeInTheDocument();
    });
  });

  describe("Formulaire de recherche (état initial)", () => {
    it("affiche l'input de recherche quand aucun résultat n'est disponible", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.getByPlaceholderText(/rechercher par nom/i)).toBeInTheDocument();
    });

    it("affiche le bouton Rechercher", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("button", { name: /rechercher/i })).toBeInTheDocument();
    });

    it("la liste des résultats n'est pas visible initialement", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.queryByText("Utilisateurs proposés")).toBeNull();
    });
  });

  describe("Liste de résultats", () => {
    beforeEach(() => {
      mockUseGetCollectionPaginated.mockReturnValue({
        data: { items: [user1], totalItems: 1 },
        isFetching: false,
      });
    });

    it("affiche le titre et les résultats quand data a des items", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.getByText("Utilisateurs proposés")).toBeInTheDocument();
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/DUPONT/)).toBeInTheDocument();
    });

    it("bouton Sélectionner désactivé sans item sélectionné", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("button", { name: /sélectionner/i })).toBeDisabled();
    });

    it("clic sur un item → bouton Sélectionner activé", async () => {
      const user = userEvent.setup();
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      await user.click(screen.getByText(/Alice/));
      expect(screen.getByRole("button", { name: /sélectionner/i })).not.toBeDisabled();
    });

    it("clic Sélectionner → onChange appelé avec l'utilisateur", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<UtilisateurCreerDrawer {...defaultProps} onChange={onChange} />);
      await screen.findByRole("dialog");
      await user.click(screen.getByText(/Alice/));
      await user.click(screen.getByRole("button", { name: /sélectionner/i }));
      expect(onChange).toHaveBeenCalledWith(user1);
    });

    it("après sélection, Annuler → réinitialise la sélection (Sélectionner redevient disabled)", async () => {
      const user = userEvent.setup();
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      await user.click(screen.getByText(/Alice/));
      expect(screen.getByRole("button", { name: /sélectionner/i })).not.toBeDisabled();
      await user.click(screen.getByRole("button", { name: /annuler/i }));
      expect(screen.getByRole("button", { name: /sélectionner/i })).toBeDisabled();
    });
  });

  describe("Résultats vides", () => {
    beforeEach(() => {
      mockUseGetCollectionPaginated.mockReturnValue({
        data: { items: [], totalItems: 0 },
        isFetching: false,
      });
    });

    it("affiche le bouton Nouvelle recherche quand la liste est vide", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("button", { name: /nouvelle recherche/i })).toBeInTheDocument();
    });

    it("n'affiche pas la liste quand la liste est vide", async () => {
      render(<UtilisateurCreerDrawer {...defaultProps} />);
      await screen.findByRole("dialog");
      expect(screen.queryByText("Utilisateurs proposés")).toBeNull();
    });
  });
});
