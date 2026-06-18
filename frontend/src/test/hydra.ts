/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/**
 * Helpers de construction de réponses au format **Hydra / API Platform**, format
 * renvoyé par le backend Esup-Oasis pour toutes les collections.
 *
 * Mutualise le `hydra:member` / `hydra:totalItems` qui était dupliqué dans
 * chaque test de hook de collection.
 */

/** Représentation minimale d'une page de collection Hydra. */
export interface HydraCollection<T> {
  "hydra:member": T[];
  "hydra:totalItems": number;
}

/**
 * Construit une page de collection Hydra.
 *
 * @param items   Membres de la page.
 * @param total   Nombre total d'éléments de la collection (par défaut `items.length`).
 */
export function hydraCollection<T>(items: T[], total: number = items.length): HydraCollection<T> {
  return {
    "hydra:member": items,
    "hydra:totalItems": total,
  };
}

/**
 * Construit une vue de collection paginée découpée automatiquement selon
 * `page` / `itemsPerPage` — pratique pour simuler un handler MSW multi-pages.
 *
 * @param allItems     L'ensemble des éléments de la collection.
 * @param page         Numéro de page demandé (1-based).
 * @param itemsPerPage Taille de page.
 */
export function hydraPage<T>(
  allItems: T[],
  page: number,
  itemsPerPage: number,
): HydraCollection<T> {
  const start = (page - 1) * itemsPerPage;
  return hydraCollection(allItems.slice(start, start + itemsPerPage), allItems.length);
}
