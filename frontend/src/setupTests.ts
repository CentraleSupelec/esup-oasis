/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import "@testing-library/jest-dom";
import { toHaveNoViolations } from "vitest-axe/dist/matchers";
import nodeCrypto from "crypto";
import { transferableAbortController } from "node:util";
import { server } from "@/mocks/server";

expect.extend({ toHaveNoViolations });

// window.env est injecté au runtime via public/env.js — on le mock pour les tests
(window as unknown as Record<string, unknown>).env = {};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };

Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (arr: Uint8Array) => nodeCrypto.randomBytes(arr.length),
  },
});

// jsdom remplace AbortController/AbortSignal par une implémentation incompatible
// avec le fetch Node (undici) utilisé par MSW. On rétablit les implémentations Node.
const nodeAbortController = transferableAbortController();
globalThis.AbortController = Object.getPrototypeOf(nodeAbortController).constructor;
globalThis.AbortSignal = Object.getPrototypeOf(nodeAbortController.signal).constructor;

// Node.js 22+ définit localStorage comme undefined sans --localstorage-file.
// Ce polyfill rétablit l'implémentation jsdom sur globalThis pour tous les tests.
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    },
    writable: true,
    configurable: true,
  });
}
