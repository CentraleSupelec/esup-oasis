/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { entiteParent } from "./Utils";

// ---------------------------------------------------------------------------
// entiteParent
// ---------------------------------------------------------------------------

describe("entiteParent", () => {
  it("retourne le chemin parent d'une IRI imbriquée sur deux niveaux", () => {
    expect(entiteParent("/beneficiaires/123/profils/22")).toBe("/beneficiaires/123");
  });

  it("retourne une chaîne vide pour une IRI sans sous-ressource", () => {
    expect(entiteParent("/beneficiaires/123")).toBe("");
  });

  it("retourne une chaîne vide pour undefined", () => {
    expect(entiteParent(undefined)).toBe("");
  });

  it("retourne une chaîne vide pour une chaîne vide", () => {
    expect(entiteParent("")).toBe("");
  });

  it("gère trois niveaux d'imbrication", () => {
    expect(entiteParent("/a/1/b/2/c/3")).toBe("/a/1/b/2");
  });
});
