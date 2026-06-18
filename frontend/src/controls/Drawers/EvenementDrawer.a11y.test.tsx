import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi } from "vitest";
import EvenementDrawer from "./Evenement/EvenementDrawer";

vi.mock("@context/drawers/DrawersContext", () => ({
  useDrawers: () => ({
    drawers: { EVENEMENT: "/evenements/1" },
    setDrawerEvenement: vi.fn(),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { isGestionnaire: true },
  }),
}));

describe("EvenementDrawer — accessibilité", () => {
  it("expose role='dialog' avec aria-modal='true'", async () => {
    render(<EvenementDrawer />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("le titre du dialog est visible et non vide", async () => {
    render(<EvenementDrawer />);
    await screen.findByRole("dialog");
    expect(screen.getByText(/évènement/i)).toBeInTheDocument();
  });

  it("le bouton Enregistrer est accessible via son rôle", async () => {
    render(<EvenementDrawer />);
    await screen.findByRole("dialog");
    expect(screen.getByRole("button", { name: /enregistrer/i })).toBeInTheDocument();
  });

  it("aucune violation axe-core (drawer ouvert)", async () => {
    render(<EvenementDrawer />);
    await screen.findByRole("dialog");
    // Le Drawer Ant Design est rendu dans document.body (portal)
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
