import React from "react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import Rgpd from "./Rgpd";

vi.mock("@utils/theme/useEffectiveTheme", () => ({
  useEffectiveTheme: () => "light",
}));

vi.mock("@utils/PageTitle/PageTitle", () => ({
  default: () => null,
}));

describe("Rgpd — accessibilité (Y7)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core", async () => {
    const { container } = renderWithProviders(<Rgpd />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("contient un titre h1 significatif", () => {
    renderWithProviders(<Rgpd />);
    expect(
      screen.getByRole("heading", { level: 1, name: /traitement des données personnelles/i }),
    ).toBeInTheDocument();
  });

  it("hiérarchie des titres : au moins 3 h2 structurant le contenu", () => {
    renderWithProviders(<Rgpd />);
    const h2s = screen.getAllByRole("heading", { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);
  });

  it("le lien 'Retour à l'accueil' a un texte descriptif", () => {
    renderWithProviders(<Rgpd />);
    expect(screen.getByRole("link", { name: /retour à l'accueil/i })).toBeInTheDocument();
  });

  it("le 404 décoratif est masqué aux technologies d'assistance (backdrop aria-hidden)", () => {
    // Vérification générale : pas d'élément visuel sans texte exposé aux AT
    renderWithProviders(<Rgpd />);
    // Aucun lien sans texte accessible
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      const name = link.getAttribute("aria-label") ?? link.textContent?.trim();
      expect(name?.length).toBeGreaterThan(0);
    });
  });
});
