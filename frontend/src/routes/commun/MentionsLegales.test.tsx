/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithProviders } from "@/test";
import MentionsLegales from "./MentionsLegales";

vi.mock("@utils/PageTitle/PageTitle", () => ({ default: () => null }));
vi.mock("@utils/theme/useEffectiveTheme", () => ({ useEffectiveTheme: () => "light" }));

function mockFetchHtml(html: string, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve({ ok, text: () => Promise.resolve(html) } as unknown as Response)),
  );
}

describe("MentionsLegales — rendu du HTML statique (XSS)", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("sanitise le contenu chargé : conserve le HTML légitime, retire script et onerror", async () => {
    mockFetchHtml(
      "<h3>Mentions</h3><p>Contenu</p><script>window.__xss = true;</script>" +
        '<img src="x" onerror="window.__xss = true">',
    );

    renderWithProviders(<MentionsLegales />);

    await waitFor(() => expect(screen.getByText("Contenu")).toBeInTheDocument());
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelector("img")?.getAttribute("onerror")).toBeNull();
  });

  it("fichier absent (réponse non ok) : message d'information de repli", async () => {
    mockFetchHtml("", false);

    renderWithProviders(<MentionsLegales />);

    await waitFor(() =>
      expect(screen.getByText(/n'ont pas encore été renseignées/i)).toBeInTheDocument(),
    );
  });
});
