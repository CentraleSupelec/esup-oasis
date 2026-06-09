/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} str - The input string to be capitalized.
 * @return {string} - The capitalized string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function pluriel(n: number, singular: string, plural: string) {
  return n > 1 ? plural : singular;
}

export type DateAsString = string;

/**
 * Cleans an identifier by removing non-alphanumeric characters.
 *
 * @param {string} id - The identifier to clean.
 * @return {string} - The cleaned identifier.
 */
export function cleanUri(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "");
}
