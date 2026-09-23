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
 * Dénominations grammaticales de l'établissement, dérivées de quatre variables
 * d'environnement :
 *
 * - `REACT_APP_ETABLISSEMENT` : nom complet, sans article (« université ESUP »).
 * - `REACT_APP_ETABLISSEMENT_ARTICLE` : nom complet avec son article contracté
 *   (« l'université ESUP »).
 * - `REACT_APP_ETABLISSEMENT_ABV` : abréviation, sans article (« ESUP »).
 * - `REACT_APP_ETABLISSEMENT_ABV_ARTICLE` : abréviation avec son article contracté
 *   (« l'ESUP »).
 *
 * Rétrocompatibilité : seuls les 2 premiers caractères des variables `*_ARTICLE` sont
 * examinés pour déterminer l'article (« le »/« la »/« l' »), ce qui tolère qu'elles
 * contiennent la dénomination complète plutôt que l'article seul.
 */

/** Dénominations grammaticales de l'établissement, par nom complet et par abréviation. */
export const etablissement = {
  nom: construireFormesGrammaticales(
    env.REACT_APP_ETABLISSEMENT ?? "",
    resoudreArticle(env.REACT_APP_ETABLISSEMENT_ARTICLE),
  ),
  abv: construireFormesGrammaticales(
    env.REACT_APP_ETABLISSEMENT_ABV ?? "",
    resoudreArticle(env.REACT_APP_ETABLISSEMENT_ABV_ARTICLE),
  ),
} as const;
