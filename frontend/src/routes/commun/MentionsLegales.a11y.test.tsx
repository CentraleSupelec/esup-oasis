import React from "react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithProviders } from "@/test";
import MentionsLegales from "./MentionsLegales";

vi.mock("@utils/theme/useEffectiveTheme", () => ({
  useEffectiveTheme: () => "light",
}));

vi.mock("@utils/PageTitle/PageTitle", () => ({
  default: () => null,
}));

function mockFetch(html: string | null) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        html !== null ? { ok: true, text: () => Promise.resolve(html) } : { ok: false },
      ),
  );
}

describe("MentionsLegales — accessibilité (Y8)", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core — contenu absent (fetch KO)", async () => {
    mockFetch(null);
    const { container } = renderWithProviders(<MentionsLegales />);
    await waitFor(() =>
      expect(
        screen.queryByText(/mentions légales de l'application n'ont pas encore/i),
      ).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("aucune violation axe-core — contenu HTML chargé (fetch OK)", async () => {
    mockFetch("<p>Mentions légales de l'établissement.</p>");
    const { container } = renderWithProviders(<MentionsLegales />);
    await waitFor(() =>
      expect(screen.getByText(/mentions légales de l'établissement/i)).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("contient un titre h1 'Mentions légales et crédits'", async () => {
    mockFetch(null);
    renderWithProviders(<MentionsLegales />);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: /mentions légales et crédits/i }),
      ).toBeInTheDocument(),
    );
  });

  it("hiérarchie des titres : h2 'Mentions légales' et h2 'Crédits'", async () => {
    mockFetch(null);
    renderWithProviders(<MentionsLegales />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 2, name: /mentions légales/i }),
      ).toBeInTheDocument();
      // "Crédits" et "Crédits images" coexistent — on vérifie qu'au moins une h2 "Crédits" est présente
      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.some((h) => h.textContent === "Crédits")).toBe(true);
    });
  });

  it("le lien 'Retour à l'accueil' a un texte descriptif", async () => {
    mockFetch(null);
    renderWithProviders(<MentionsLegales />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /retour à l'accueil/i })).toBeInTheDocument(),
    );
  });

  it("le HTML injecté est sanitisé : les scripts sont retirés", async () => {
    mockFetch('<p>Contenu valide</p><script>alert("xss")</script>');
    const { container } = renderWithProviders(<MentionsLegales />);
    await waitFor(() => expect(screen.getByText(/contenu valide/i)).toBeInTheDocument());
    expect(container.querySelector("script")).toBeNull();
  });
});
