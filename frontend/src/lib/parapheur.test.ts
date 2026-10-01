/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import { describe, expect, it, vi } from "vitest";
import { IUtilisateur } from "@api";

// nom de la décision fixé ici pour ne pas dépendre de la configuration de l'environnement de test
vi.mock("./decisionEtab", () => ({ decisionEtab: { Defini: "Le PAEH" } }));

import { verrouSignature } from "./parapheur";

function beneficiaire(etat?: string): IUtilisateur {
  return { decisionAmenagementAnneeEnCours: etat ? { etat } : null } as IUtilisateur;
}

describe("verrouSignature", () => {
  it("bloque les modifications tant que la décision est dans le circuit de signature", () => {
    expect(verrouSignature(beneficiaire("EN_SIGNATURE"))).toBe(
      "Le PAEH est en cours de signature électronique : modification impossible jusqu'à la fin du circuit.",
    );
  });

  it("laisse modifier une décision refusée, à reprendre par le gestionnaire", () => {
    expect(verrouSignature(beneficiaire("REFUSEE"))).toBeUndefined();
  });

  it("laisse modifier hors signature ou sans décision", () => {
    expect(verrouSignature(beneficiaire("ATTENTE_VALIDATION_CAS"))).toBeUndefined();
    expect(verrouSignature(beneficiaire("EDITE"))).toBeUndefined();
    expect(verrouSignature(beneficiaire())).toBeUndefined();
    expect(verrouSignature(undefined)).toBeUndefined();
  });
});
