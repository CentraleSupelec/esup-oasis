/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { objectToQuery, queryToObject } from "./url";

// ---------------------------------------------------------------------------
// objectToQuery
// ---------------------------------------------------------------------------

describe("objectToQuery", () => {
  it("convertit un objet simple en query string", () => {
    expect(objectToQuery({ page: "1", limit: "10" })).toBe("page=1&limit=10");
  });

  it("encode les caractères spéciaux", () => {
    const result = objectToQuery({ q: "hello world" });
    expect(result).toBe("q=hello+world");
  });

  it("retourne une chaîne vide pour un objet vide", () => {
    expect(objectToQuery({})).toBe("");
  });

  it("gère un seul paramètre", () => {
    expect(objectToQuery({ id: "42" })).toBe("id=42");
  });
});

// ---------------------------------------------------------------------------
// queryToObject
// ---------------------------------------------------------------------------

describe("queryToObject", () => {
  it("convertit une query string en objet", () => {
    expect(queryToObject("page=1&limit=10")).toEqual({ page: "1", limit: "10" });
  });

  it("retourne un objet vide pour une chaîne vide", () => {
    expect(queryToObject("")).toEqual({});
  });

  it("gère un seul paramètre", () => {
    expect(queryToObject("id=42")).toEqual({ id: "42" });
  });
});

// ---------------------------------------------------------------------------
// Aller-retour objectToQuery → queryToObject
// ---------------------------------------------------------------------------

describe("objectToQuery / queryToObject (aller-retour)", () => {
  it("restitue l'objet d'origine après conversion", () => {
    const original = { role: "gestionnaire", page: "2" };
    expect(queryToObject(objectToQuery(original))).toEqual(original);
  });
});
