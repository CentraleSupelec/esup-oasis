/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/**
 * Check if an array contains duplicates.
 * (This function uses the Set object to check for duplicates.)
 *
 * @param {Array} array - The input array to be checked.
 * @returns {boolean} - Returns true if the array contains duplicates, otherwise false.
 */
export function arrayContainsDuplicates<T>(array: T[]): boolean {
  return new Set(array).size !== array.length;
}

export function arrayUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

// ---

export function ascToAscend(
  str: "asc" | "desc" | null | undefined,
): "ascend" | "descend" | undefined {
  if (str === "asc") {
    return "ascend";
  }
  if (str === "desc") {
    return "descend";
  }
  return undefined;
}

export function ascendToAsc(
  str: "ascend" | "descend" | null | undefined,
): "asc" | "desc" | undefined {
  if (str === "ascend") {
    return "asc";
  }
  if (str === "descend") {
    return "desc";
  }
  return undefined;
}
