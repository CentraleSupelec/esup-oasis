/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BoutonDecisionEtab } from "./BoutonDecisionEtab";

// ─── Mocks ───

const { mockUseGetItem, mockUsePatch } = vi.hoisted(() => ({
  mockUseGetItem: vi.fn(),
  mockUsePatch: vi.fn(),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetItem: mockUseGetItem,
    usePatch: mockUsePatch,
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { isAdmin: true } }),
}));

vi.mock("@utils/apiDownloader", () => ({ default: vi.fn() }));

/**
 * L'exigence d'une date d'avis du médecin avant édition est propre aux établissements
 * dont le visa du document la cite. Le serveur l'indique sur la décision : l'interface
 * ne doit ni la deviner, ni l'appliquer là où elle n'a pas lieu d'être.
 */
describe("BoutonDecisionEtab — exigence de la date d'avis du médecin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePatch.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  function rendreAvecDecision(decision: Record<string, unknown>) {
    mockUseGetItem.mockReturnValue({
      data: {
        decisionAmenagementAnneeEnCours: {
          "@id": "/utilisateurs/test@uni.fr/decisions/2026",
          etat: "ATTENTE_VALIDATION_CAS",
          ...decision,
        },
      },
      isFetching: false,
    });

    return render(
      <App>
        <BoutonDecisionEtab utilisateurId="test@uni.fr" />
      </App>,
    );
  }

  async function ouvrirLeMenu(): Promise<HTMLElement> {
    await userEvent.click(await screen.findByRole("button", { name: /Décision d'étab/ }));
    return screen.findByRole("menuitem", { name: /Envoyer la décision étab/ });
  }

  it("laisse l'envoi disponible quand la date n'est pas exigée", async () => {
    // Comportement d'une instance qui n'active rien : inchangé, quelle que soit la date.
    rendreAvecDecision({ dateAvisMedecinRequise: false, dateAvisMedecin: null });

    expect(await ouvrirLeMenu()).not.toHaveAttribute("aria-disabled", "true");
  });

  it("laisse l'envoi disponible quand le serveur ne se prononce pas", async () => {
    // Décision sérialisée sans la propriété : on ne bloque pas par défaut.
    rendreAvecDecision({ dateAvisMedecin: null });

    expect(await ouvrirLeMenu()).not.toHaveAttribute("aria-disabled", "true");
  });

  it("empêche l'envoi quand la date est exigée et manquante", async () => {
    rendreAvecDecision({ dateAvisMedecinRequise: true, dateAvisMedecin: null });

    expect(await ouvrirLeMenu()).toHaveAttribute("aria-disabled", "true");
  });

  it("rétablit l'envoi dès que la date est saisie", async () => {
    rendreAvecDecision({ dateAvisMedecinRequise: true, dateAvisMedecin: "2026-09-01" });

    expect(await ouvrirLeMenu()).not.toHaveAttribute("aria-disabled", "true");
  });
});
