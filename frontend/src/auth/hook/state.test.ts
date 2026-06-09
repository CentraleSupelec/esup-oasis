/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { OAUTH_NONCE_KEY, OAUTH_STATE_KEY } from "./constants";
import {
  generateNonce,
  generateState,
  getNonce,
  removeNonce,
  removeState,
  saveNonce,
  saveState,
} from "./state";

// ---------------------------------------------------------------------------
// generateState
// ---------------------------------------------------------------------------

describe("generateState", () => {
  it("retourne une chaîne de 40 caractères", () => {
    expect(generateState()).toHaveLength(40);
  });

  it("ne contient que des caractères alphanumériques", () => {
    expect(generateState()).toMatch(/^[A-Za-z0-9]{40}$/);
  });
});

// ---------------------------------------------------------------------------
// saveState / removeState
// ---------------------------------------------------------------------------

describe("saveState", () => {
  beforeEach(() => sessionStorage.clear());

  it("stocke la valeur dans sessionStorage sous la bonne clé", () => {
    saveState("csrf-token");
    expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBe("csrf-token");
  });
});

// ---------------------------------------------------------------------------
// removeState
// ---------------------------------------------------------------------------

describe("removeState", () => {
  beforeEach(() => sessionStorage.clear());

  it("supprime la valeur de sessionStorage", () => {
    saveState("csrf-token");
    removeState();
    expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// generateNonce
// ---------------------------------------------------------------------------

describe("generateNonce", () => {
  it("retourne une chaîne de 40 caractères", () => {
    expect(generateNonce()).toHaveLength(40);
  });

  it("ne contient que des caractères alphanumériques", () => {
    expect(generateNonce()).toMatch(/^[A-Za-z0-9]{40}$/);
  });
});

// ---------------------------------------------------------------------------
// saveNonce
// ---------------------------------------------------------------------------

describe("saveNonce", () => {
  beforeEach(() => sessionStorage.clear());

  it("stocke la valeur dans sessionStorage sous la bonne clé", () => {
    saveNonce("replay-nonce");
    expect(sessionStorage.getItem(OAUTH_NONCE_KEY)).toBe("replay-nonce");
  });
});

// ---------------------------------------------------------------------------
// getNonce
// ---------------------------------------------------------------------------

describe("getNonce", () => {
  beforeEach(() => sessionStorage.clear());

  it("retourne la valeur précédemment sauvegardée", () => {
    saveNonce("replay-nonce");
    expect(getNonce()).toBe("replay-nonce");
  });

  it("retourne null si aucun nonce n'est stocké", () => {
    expect(getNonce()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// removeNonce
// ---------------------------------------------------------------------------

describe("removeNonce", () => {
  beforeEach(() => sessionStorage.clear());

  it("supprime le nonce de sessionStorage", () => {
    saveNonce("replay-nonce");
    removeNonce();
    expect(getNonce()).toBeNull();
  });
});
