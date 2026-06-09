/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { vi } from "vitest";
import { buildUrl } from "./UrlBuilder";

const mockEnv = { REACT_APP_API_PREFIX: "" };

vi.mock("@/env", () => ({
  get env() {
    return mockEnv;
  },
}));

const BASE = "http://example.com";

// ---------------------------------------------------------------------------
// URL de base (sans paramètres ni query)
// ---------------------------------------------------------------------------

describe("buildUrl — URL de base", () => {
  beforeEach(() => {
    mockEnv.REACT_APP_API_PREFIX = "";
  });

  it("construit une URL simple à partir du path", () => {
    const url = buildUrl(BASE, "/evenements" as never);
    expect(url.toString()).toBe("http://example.com/evenements");
  });

  it("ajoute le préfixe API quand il est configuré", () => {
    mockEnv.REACT_APP_API_PREFIX = "/api";
    const url = buildUrl(BASE, "/evenements" as never);
    expect(url.toString()).toBe("http://example.com/api/evenements");
  });

  it("ne double pas le préfixe si le path le contient déjà", () => {
    mockEnv.REACT_APP_API_PREFIX = "/api";
    const url = buildUrl(BASE, "/api/evenements" as never);
    expect(url.toString()).toBe("http://example.com/api/evenements");
  });

  it("le paramètre url remplace le path comme template", () => {
    const url = buildUrl(BASE, "/evenements" as never, "/autre/chemin");
    expect(url.toString()).toBe("http://example.com/autre/chemin");
  });

  it("supprime le slash final du préfixe API", () => {
    mockEnv.REACT_APP_API_PREFIX = "/api/";
    const url = buildUrl(BASE, "/evenements" as never);
    expect(url.toString()).toBe("http://example.com/api/evenements");
  });
});

// ---------------------------------------------------------------------------
// Paramètres de chemin (path parameters)
// ---------------------------------------------------------------------------

describe("buildUrl — paramètres de chemin", () => {
  beforeEach(() => {
    mockEnv.REACT_APP_API_PREFIX = "";
  });

  it("remplace {id} par la valeur IRI fournie", () => {
    const url = buildUrl(BASE, "/evenements/{id}" as never, undefined, {
      id: "/api/evenements/42",
    } as never);
    expect(url.toString()).toBe("http://example.com/api/evenements/42");
  });

  it("remplace un paramètre et retire le segment qui précède {param}", () => {
    // Comportement : l'élément juste avant {id} dans le split est supprimé
    // et {id} est remplacé par la valeur
    const url = buildUrl(BASE, "/evenements/{id}" as never, undefined, { id: "42" } as never);
    // "evenements" (index paramIndex-1) est supprimé, "42" remplace {id}
    expect(url.pathname).toBe("/42");
  });

  it("gère deux paramètres successifs dans le chemin", () => {
    const url = buildUrl(BASE, "/types_evenements/{typeId}/taux/{id}" as never, undefined, {
      typeId: "5",
      id: "3",
    } as never);
    // "types_evenements" et "taux" (segments devant chaque param) sont retirés
    expect(url.pathname).toBe("/5/3");
  });

  it("applique les paramètres au template url quand url est fourni", () => {
    const url = buildUrl(BASE, "/evenements/{id}" as never, "/custom/{id}", { id: "99" } as never);
    // "custom" est retiré, {id} remplacé par "99"
    expect(url.pathname).toBe("/99");
  });
});

// ---------------------------------------------------------------------------
// Query string
// ---------------------------------------------------------------------------

describe("buildUrl — query string", () => {
  beforeEach(() => {
    mockEnv.REACT_APP_API_PREFIX = "";
  });

  it("ajoute un paramètre de type string", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      statut: "actif",
    } as never);
    expect(url.searchParams.get("statut")).toBe("actif");
  });

  it("ajoute un paramètre de type nombre", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      page: 2,
    } as never);
    expect(url.searchParams.get("page")).toBe("2");
  });

  it("ajoute un paramètre de type booléen", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      actif: true,
    } as never);
    expect(url.searchParams.get("actif")).toBe("true");
  });

  it("répète les valeurs de tableau sans crochets", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      ids: ["1", "2", "3"],
    } as never);
    expect(url.searchParams.getAll("ids")).toEqual(["1", "2", "3"]);
    expect(url.searchParams.has("ids[]")).toBe(false);
  });

  it("filtre les valeurs null", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      statut: null,
      page: 1,
    } as never);
    expect(url.searchParams.has("statut")).toBe(false);
    expect(url.searchParams.get("page")).toBe("1");
  });

  it("filtre les valeurs undefined", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      statut: undefined,
      page: 1,
    } as never);
    expect(url.searchParams.has("statut")).toBe(false);
  });

  it("trie les paramètres par ordre alphabétique des clés", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {
      zParam: "z",
      aParam: "a",
      mParam: "m",
    } as never);
    const keys = [...url.searchParams.keys()];
    expect(keys).toEqual(["aParam", "mParam", "zParam"]);
  });

  it("n'ajoute pas de query string si l'objet est vide", () => {
    const url = buildUrl(BASE, "/evenements" as never, undefined, undefined, {} as never);
    expect(url.search).toBe("");
  });
});
