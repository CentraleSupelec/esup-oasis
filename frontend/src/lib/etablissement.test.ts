/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {} as Record<string, unknown>,
}));

vi.mock("@/env", () => ({
  get env() {
    return mockEnv;
  },
}));

/** Recharge le module `etablissement` avec la configuration d'environnement courante. */
async function chargerEtablissement(env: Record<string, unknown>) {
  Object.keys(mockEnv).forEach((k) => delete mockEnv[k]);
  Object.assign(mockEnv, env);
  vi.resetModules();
  return (await import("./etablissement")).etablissement;
}

beforeEach(() => {
  vi.resetModules();
});

describe("etablissement — nom complet avec article contracté dans la valeur", () => {
  it("extrait l'article « l' » à partir du préfixe de la dénomination complète", async () => {
    const etablissement = await chargerEtablissement({
      REACT_APP_ETABLISSEMENT: "université ESUP",
      REACT_APP_ETABLISSEMENT_ARTICLE: "l'université ESUP",
      REACT_APP_ETABLISSEMENT_ABV: "ESUP",
      REACT_APP_ETABLISSEMENT_ABV_ARTICLE: "l'ESUP",
    });

    expect(etablissement.nom.denomination).toBe("université ESUP");
    expect(etablissement.nom.defini).toBe("l'université ESUP");
    expect(etablissement.nom.de).toBe("de l'université ESUP");
    expect(etablissement.nom.a).toBe("à l'université ESUP");
  });
});

describe("etablissement — article « la »", () => {
  it("dérive les formes contractées avec « la »", async () => {
    const etablissement = await chargerEtablissement({
      REACT_APP_ETABLISSEMENT: "Cellule d'accompagnement",
      REACT_APP_ETABLISSEMENT_ARTICLE: "la Cellule d'accompagnement",
      REACT_APP_ETABLISSEMENT_ABV: "CAE",
      REACT_APP_ETABLISSEMENT_ABV_ARTICLE: "la CAE",
    });

    expect(etablissement.nom.defini).toBe("la Cellule d'accompagnement");
    expect(etablissement.nom.de).toBe("de la Cellule d'accompagnement");
    expect(etablissement.nom.a).toBe("à la Cellule d'accompagnement");
  });
});

describe("etablissement — article « le »", () => {
  it("dérive les formes contractées avec « le »", async () => {
    const etablissement = await chargerEtablissement({
      REACT_APP_ETABLISSEMENT: "CROUS",
      REACT_APP_ETABLISSEMENT_ARTICLE: "le CROUS",
      REACT_APP_ETABLISSEMENT_ABV: "CROUS",
      REACT_APP_ETABLISSEMENT_ABV_ARTICLE: "le CROUS",
    });

    expect(etablissement.nom.defini).toBe("le CROUS");
    expect(etablissement.nom.de).toBe("du CROUS");
    expect(etablissement.nom.a).toBe("au CROUS");
  });
});

describe("etablissement — abréviation indépendante du nom complet", () => {
  it("résout l'article de l'abréviation séparément de celui du nom", async () => {
    const etablissement = await chargerEtablissement({
      REACT_APP_ETABLISSEMENT: "université ESUP",
      REACT_APP_ETABLISSEMENT_ARTICLE: "l'université ESUP",
      REACT_APP_ETABLISSEMENT_ABV: "ESUP",
      REACT_APP_ETABLISSEMENT_ABV_ARTICLE: "l'ESUP",
    });

    expect(etablissement.abv.denomination).toBe("ESUP");
    expect(etablissement.abv.defini).toBe("l'ESUP");
    expect(etablissement.abv.de).toBe("de l'ESUP");
    expect(etablissement.abv.a).toBe("à l'ESUP");
  });
});

describe("etablissement — valeurs de configuration tolérantes", () => {
  it("retombe sur « le » quand l'article n'est pas reconnu", async () => {
    const etablissement = await chargerEtablissement({
      REACT_APP_ETABLISSEMENT: "Université de Test",
      REACT_APP_ETABLISSEMENT_ARTICLE: "Université de Test",
      REACT_APP_ETABLISSEMENT_ABV: "UT",
      REACT_APP_ETABLISSEMENT_ABV_ARTICLE: "UT",
    });

    expect(etablissement.nom.defini).toBe("le Université de Test");
    expect(etablissement.abv.defini).toBe("le UT");
  });
});
