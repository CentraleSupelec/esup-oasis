/*
 * Copyright (c) 2026. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("@context/api/ApiProvider", () => ({ useApi: () => ({}) }));
vi.mock("@/auth/AuthProvider", () => ({ useAuth: () => ({}) }));
vi.mock("@/queryClient", () => ({ queryClient: {} }));
vi.mock("@utils/apiDownloader", () => ({ default: vi.fn() }));

import { EtatSignatureDecision, libellesSignature } from "./BoutonDecisionEtab";

describe("libellesSignature", () => {
  it("ne change rien à une décision envoyée par e-mail", () => {
    expect(libellesSignature(null, null)).toBeNull();
    expect(libellesSignature(undefined, undefined)).toBeNull();
  });

  it("annonce la signature en cours plutôt qu'un envoi imminent", () => {
    const libelles = libellesSignature(EtatSignatureDecision.EN_SIGNATURE, null);

    expect(libelles?.bouton).toBe("Décision d'étab. en signature");
    expect(libelles?.legende).toBe("La décision est en cours de signature électronique.");
    expect(libelles?.enErreur).toBe(false);
  });

  it("indique la fraîcheur de l'état quand la dernière vérification est connue", () => {
    const libelles = libellesSignature(EtatSignatureDecision.EN_SIGNATURE, "2026-09-23T14:05:00");

    expect(libelles?.legende).toContain("Dernière vérification le 23/09/2026 à 14:05.");
  });

  it.each([
    [EtatSignatureDecision.REFUSEE, "Signature de la décision refusée"],
    [EtatSignatureDecision.EXPIREE, "Signature de la décision interrompue"],
    [EtatSignatureDecision.ERREUR, "Erreur de signature de la décision"],
  ])("signale l'issue négative %s", (etat, bouton) => {
    const libelles = libellesSignature(etat, null);

    expect(libelles?.bouton).toBe(bouton);
    expect(libelles?.enErreur).toBe(true);
  });
});
