/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import { env } from "@/env";
import { IUtilisateur } from "@api";
import { decisionEtab } from "./decisionEtab";

/**
 * Vrai quand un parapheur électronique est configuré : `REACT_APP_PARAPHEUR` reflète la variable
 * backend `PARAPHEUR`. Les réglages qui n'ont de sens qu'avec un parapheur, comme le circuit de
 * signature d'une composante, ne sont affichés que dans ce cas.
 */
export function parapheurConfigure(): boolean {
  return !!env.REACT_APP_PARAPHEUR?.trim();
}

/**
 * Motif à afficher sur les actions bloquées quand la décision de l'année est dans le circuit de
 * signature, `undefined` sinon. Le serveur refuse ces modifications de toute façon : l'interface
 * les désactive pour l'annoncer avant la saisie.
 */
export function verrouSignature(utilisateur?: IUtilisateur): string | undefined {
  if (utilisateur?.decisionAmenagementAnneeEnCours?.etat !== "EN_SIGNATURE") {
    return undefined;
  }

  return `${decisionEtab.Defini} est en cours de signature électronique : modification impossible jusqu'à la fin du circuit.`;
}
