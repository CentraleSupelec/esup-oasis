/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { arrayContainsDuplicates, arrayUnique, ascendToAsc, ascToAscend } from "./array";

// ---------------------------------------------------------------------------
// arrayContainsDuplicates
// ---------------------------------------------------------------------------

describe("arrayContainsDuplicates", () => {
  it("retourne false pour un tableau sans doublons", () => {
    expect(arrayContainsDuplicates([1, 2, 3])).toBe(false);
  });

  it("retourne true pour un tableau avec doublons", () => {
    expect(arrayContainsDuplicates([1, 1])).toBe(true);
  });

  it("retourne true pour un tableau de chaînes avec doublons", () => {
    expect(arrayContainsDuplicates(["a", "b", "a"])).toBe(true);
  });

  it("retourne false pour un tableau vide", () => {
    expect(arrayContainsDuplicates([])).toBe(false);
  });

  it("retourne false pour un tableau d'un seul élément", () => {
    expect(arrayContainsDuplicates(["a"])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// arrayUnique (utilisée comme callback de .filter)
// ---------------------------------------------------------------------------

describe("arrayUnique", () => {
  it("filtre les doublons d'un tableau de nombres", () => {
    expect([1, 2, 2, 3, 1].filter(arrayUnique)).toEqual([1, 2, 3]);
  });

  it("filtre les doublons d'un tableau de chaînes", () => {
    expect(["a", "b", "a", "c"].filter(arrayUnique)).toEqual(["a", "b", "c"]);
  });

  it("retourne un tableau identique s'il n'y a pas de doublons", () => {
    expect([1, 2, 3].filter(arrayUnique)).toEqual([1, 2, 3]);
  });

  it("retourne un tableau vide pour un tableau vide", () => {
    expect(([] as number[]).filter(arrayUnique)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ascToAscend
// ---------------------------------------------------------------------------

describe("ascToAscend", () => {
  it("convertit 'asc' en 'ascend'", () => {
    expect(ascToAscend("asc")).toBe("ascend");
  });

  it("convertit 'desc' en 'descend'", () => {
    expect(ascToAscend("desc")).toBe("descend");
  });

  it("retourne undefined pour null", () => {
    expect(ascToAscend(null)).toBeUndefined();
  });

  it("retourne undefined pour undefined", () => {
    expect(ascToAscend(undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ascendToAsc
// ---------------------------------------------------------------------------

describe("ascendToAsc", () => {
  it("convertit 'ascend' en 'asc'", () => {
    expect(ascendToAsc("ascend")).toBe("asc");
  });

  it("convertit 'descend' en 'desc'", () => {
    expect(ascendToAsc("descend")).toBe("desc");
  });

  it("retourne undefined pour null", () => {
    expect(ascendToAsc(null)).toBeUndefined();
  });

  it("retourne undefined pour undefined", () => {
    expect(ascendToAsc(undefined)).toBeUndefined();
  });
});
