/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

/**
 * Moteur grammatical partagé pour dériver les formes définies / contractées d'une
 * dénomination (article défini, « de »/« du »/« de la »/« de l' », « à »/« au »/« à la »/« à l' »).
 *
 * Utilisé par {@link "./service"} (dénomination du service d'accompagnement) et
 * {@link "./etablissement"} (nom et abréviation de l'établissement).
 */

export type Article = "le" | "la" | "l'";

/** Préfixes (article défini + prépositions contractées) pour chaque article. */
const PREFIXES: Record<Article, { defini: string; de: string; a: string }> = {
  le: { defini: "le ", de: "du ", a: "au " },
  la: { defini: "la ", de: "de la ", a: "à la " },
  // Élision : pas d'espace après l'apostrophe.
  "l'": { defini: "l'", de: "de l'", a: "à l'" },
};

/**
 * Résout l'article défini à partir d'une valeur de configuration.
 *
 * Rétrocompatibilité : on ne regarde que les 2 premiers caractères, ce qui permet à cette
 * même fonction de traiter aussi bien un article seul (`"le"`) qu'une dénomination complète
 * dans laquelle l'article est contracté (`"l'université ESUP"`).
 */
export function resoudreArticle(value: string | null | undefined): Article {
  const brut = value?.substring(0, 2).trim().toLowerCase();
  return brut === "la" || brut === "l'" ? brut : "le";
}

/** Passe la première lettre en majuscule (pour un début de phrase). */
export function capitaliser(valeur: string): string {
  return valeur.charAt(0).toUpperCase() + valeur.slice(1);
}

/** Formes grammaticales dérivées d'une dénomination et de son article. */
export interface FormesGrammaticales {
  /** Groupe nominal nu : « service PHASE » / « université ESUP » / « ESUP ». */
  denomination: string;
  /** Forme définie : « le service PHASE » / « l'université ESUP ». */
  defini: string;
  /** Préposition « de » contractée : « du service PHASE » / « de l'université ESUP ». */
  de: string;
  /** Préposition « à » contractée : « au service PHASE » / « à l'université ESUP ». */
  a: string;
  /** Variantes majuscule utilisée en début de phrase (ou comme titre). */
  Denomination: string;
  Defini: string;
  De: string;
  A: string;
}

/** Construit les formes grammaticales d'une dénomination pour un article donné. */
export function construireFormesGrammaticales(
  denomination: string,
  article: Article,
): FormesGrammaticales {
  const prefixe = PREFIXES[article];

  const defini = prefixe.defini + denomination;
  const de = prefixe.de + denomination;
  const a = prefixe.a + denomination;

  return {
    denomination,
    defini,
    de,
    a,
    Denomination: capitaliser(denomination),
    Defini: capitaliser(defini),
    De: capitaliser(de),
    A: capitaliser(a),
  };
}
