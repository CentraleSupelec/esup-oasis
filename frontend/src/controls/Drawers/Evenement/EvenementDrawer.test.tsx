import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EvenementDrawer from "./EvenementDrawer";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { mockSetDrawerEvenement, mockDrawers } = vi.hoisted(() => ({
  mockSetDrawerEvenement: vi.fn(),
  mockDrawers: { EVENEMENT: undefined as string | undefined },
}));

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(() => ({ user: { isGestionnaire: true } })),
}));

vi.mock("@context/drawers/DrawersContext", () => ({
  useDrawers: () => ({
    drawers: mockDrawers,
    setDrawerEvenement: mockSetDrawerEvenement,
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: mockUseAuth,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EvenementDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDrawers.EVENEMENT = undefined;
    mockUseAuth.mockReturnValue({ user: { isGestionnaire: true } });
  });

  describe("Rendu conditionnel selon l'ID", () => {
    it("sans ID (ni prop ni contexte) → aucun dialog rendu", () => {
      render(<EvenementDrawer />);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("ID via prop → drawer rendu comme dialog", async () => {
      render(<EvenementDrawer id="/evenements/42" />);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("ID via contexte drawer → drawer rendu", async () => {
      mockDrawers.EVENEMENT = "/evenements/99";
      render(<EvenementDrawer />);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("prop ID prioritaire sur le contexte", async () => {
      mockDrawers.EVENEMENT = "/evenements/99";
      render(<EvenementDrawer id="/evenements/42" />);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Contenu du drawer", () => {
    beforeEach(() => {
      mockDrawers.EVENEMENT = "/evenements/1";
    });

    it("titre ÉVÈNEMENT visible", async () => {
      render(<EvenementDrawer />);
      await screen.findByRole("dialog");
      expect(screen.getByText(/évènement/i)).toBeInTheDocument();
    });

    it("onglet Informations présent", async () => {
      render(<EvenementDrawer />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("tab", { name: /informations/i })).toBeInTheDocument();
    });

    it("bouton Enregistrer présent", async () => {
      render(<EvenementDrawer />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("button", { name: /enregistrer/i })).toBeInTheDocument();
    });
  });

  describe("Permissions (isGestionnaire)", () => {
    beforeEach(() => {
      mockDrawers.EVENEMENT = "/evenements/1";
    });

    it("gestionnaire → formulaire actif, bouton Enregistrer cliquable", async () => {
      mockUseAuth.mockReturnValue({ user: { isGestionnaire: true } });
      render(<EvenementDrawer />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("button", { name: /enregistrer/i })).not.toBeDisabled();
    });

    it("non-gestionnaire → formulaire désactivé, bouton Enregistrer grisé", async () => {
      mockUseAuth.mockReturnValue({ user: { isGestionnaire: false } });
      render(<EvenementDrawer />);
      await screen.findByRole("dialog");
      expect(screen.getByRole("button", { name: /enregistrer/i })).toBeDisabled();
    });
  });

  describe("Fermeture", () => {
    it("clic sur le bouton de fermeture → setDrawerEvenement(undefined)", async () => {
      mockDrawers.EVENEMENT = "/evenements/1";
      const user = userEvent.setup();
      render(<EvenementDrawer />);
      await screen.findByRole("dialog");
      const closeBtn = document.querySelector(".ant-drawer-close") as HTMLElement;
      expect(closeBtn).not.toBeNull();
      await user.click(closeBtn);
      expect(mockSetDrawerEvenement).toHaveBeenCalledWith(undefined);
    });
  });
});
