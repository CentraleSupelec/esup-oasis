/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { OAUTH_NONCE_KEY, OAUTH_STATE_KEY } from "@/auth/hook/constants";

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
const TOKEN_LENGTH = 40;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const getCharacter = (value: number): string => ALPHABET[value % ALPHABET.length];

const generateToken = (): string => {
  const randomValues = new Uint8Array(TOKEN_LENGTH);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues, getCharacter).join("");
};

// --- State (protection CSRF)
export const generateState = (): string => generateToken();
export const saveState = (state: string): void => sessionStorage.setItem(OAUTH_STATE_KEY, state);
export const removeState = (): void => sessionStorage.removeItem(OAUTH_STATE_KEY);

// --- Nonce (protection replay — vérifié par le serveur si OIDC, envoyé systématiquement)
export const generateNonce = (): string => generateToken();
export const saveNonce = (nonce: string): void => sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);
export const getNonce = (): string | null => sessionStorage.getItem(OAUTH_NONCE_KEY);
export const removeNonce = (): void => sessionStorage.removeItem(OAUTH_NONCE_KEY);
