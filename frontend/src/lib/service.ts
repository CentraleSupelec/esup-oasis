/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { env } from "@/env";
import { construireFormesGrammaticales, resoudreArticle } from "./denomination";

/**
 * Dénominations grammaticales du service d'accompagnement des étudiants.
 *
 * Chaque établissement rattache l'application à une structure dont le nom varie
 * (« service PHASE », « SARE », « Cellule d'aide aux étudiants »…). Ce module dérive
 * toutes les formes nécessaires à partir de trois variables d'environnement :
 *
 * - `REACT_APP_SERVICE` : sigle / nom court, employé seul dans les intitulés composés
 *   (« Accompagnement PHASE », « Renfort PHASE »).
 * - `REACT_APP_SERVICE_DENOMINATION` : groupe nominal complet, sans article, tel qu'il
 *   apparaît au milieu d'une phrase (« service PHASE », « Cellule d'aide aux étudiants »).
 * - `REACT_APP_SERVICE_ARTICLE` : article défini associé (`le`, `la` ou `l'`).
 * - `REACT_APP_SERVICE_DENOMINATION_LONGUE` : dénomination développée, réservée à la
 *   première mention dans un document formel (page RGPD). Optionnelle : par défaut égale
 *   à `REACT_APP_SERVICE_DENOMINATION`.
 *
 * Rétrocompatibilité : sans `REACT_APP_SERVICE_DENOMINATION`, on retombe sur
 * `service <REACT_APP_SERVICE>` avec l'article `le`, soit les textes historiques.
 */

function resoudreDenomination(): string {
  return env.REACT_APP_SERVICE_DENOMINATION?.trim() || `service ${env.REACT_APP_SERVICE}`;
}

function resoudreDenominationLongue(denomination: string): string {
  return env.REACT_APP_SERVICE_DENOMINATION_LONGUE?.trim() || denomination;
}

function construireService() {
  const denomination = resoudreDenomination();
  const denominationLongue = resoudreDenominationLongue(denomination);
  const article = resoudreArticle(env.REACT_APP_SERVICE_ARTICLE);

  const formes = construireFormesGrammaticales(denomination, article);
  const formesLongues = construireFormesGrammaticales(denominationLongue, article);

  return {
    /** Sigle / nom court, pour les intitulés composés : `Accompagnement ${service.sigle}`. */
    sigle: env.REACT_APP_SERVICE,
    ...formes,
    /**
     * Dénomination développée, réservée à la première mention dans un document formel
     * (page RGPD). Égale à {@link formes.denomination} si non configurée.
     */
    denominationLongue: formesLongues.denomination,
    /** Forme définie sur la dénomination développée (première mention d'un document formel). */
    definiLong: formesLongues.defini,
    DenominationLongue: formesLongues.Denomination,
    DefiniLong: formesLongues.Defini,
  } as const;
}

/** Dénominations grammaticales du service, dérivées de la configuration d'environnement. */
export const service = construireService();
