/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  AmenagementDomaine,
  DOMAINES_AMENAGEMENTS_INFOS,
  getAmenagementsByCategories,
  getDomaineAmenagement,
  getTypesAmenagementByCategories,
} from "./amenagements";

// ---------------------------------------------------------------------------
// getDomaineAmenagement
// ---------------------------------------------------------------------------

describe("getDomaineAmenagement", () => {
  it("retourne les infos pédagogiques si pedagogique est true", () => {
    expect(getDomaineAmenagement({ pedagogique: true } as never)).toBe(
      DOMAINES_AMENAGEMENTS_INFOS[AmenagementDomaine.pedagogique],
    );
  });

  it("retourne les infos examens si examens est true", () => {
    expect(getDomaineAmenagement({ examens: true } as never)).toBe(
      DOMAINES_AMENAGEMENTS_INFOS[AmenagementDomaine.examen],
    );
  });

  it("retourne les infos aide humaine si aideHumaine est true", () => {
    expect(getDomaineAmenagement({ aideHumaine: true } as never)).toBe(
      DOMAINES_AMENAGEMENTS_INFOS[AmenagementDomaine.aideHumaine],
    );
  });

  it("retourne null si aucun domaine n'est activé", () => {
    expect(
      getDomaineAmenagement({ pedagogique: false, aideHumaine: false, examens: false } as never),
    ).toBeNull();
  });

  it("retourne null pour undefined", () => {
    expect(getDomaineAmenagement(undefined)).toBeNull();
  });

  it("pédagogique a la priorité sur examens si les deux sont true", () => {
    expect(getDomaineAmenagement({ pedagogique: true, examens: true } as never)).toBe(
      DOMAINES_AMENAGEMENTS_INFOS[AmenagementDomaine.pedagogique],
    );
  });
});

// ---------------------------------------------------------------------------
// DOMAINES_AMENAGEMENTS_INFOS — structure de référence
// ---------------------------------------------------------------------------

describe("DOMAINES_AMENAGEMENTS_INFOS", () => {
  it("contient les trois domaines attendus", () => {
    expect(DOMAINES_AMENAGEMENTS_INFOS).toHaveProperty(AmenagementDomaine.pedagogique);
    expect(DOMAINES_AMENAGEMENTS_INFOS).toHaveProperty(AmenagementDomaine.aideHumaine);
    expect(DOMAINES_AMENAGEMENTS_INFOS).toHaveProperty(AmenagementDomaine.examen);
  });

  it("examen a dateFinAmenagementObligatoire à true", () => {
    expect(
      DOMAINES_AMENAGEMENTS_INFOS[AmenagementDomaine.examen].dateFinAmenagementObligatoire,
    ).toBe(true);
  });

  it("pédagogique a dateFinAmenagementObligatoire à false", () => {
    expect(
      DOMAINES_AMENAGEMENTS_INFOS[AmenagementDomaine.pedagogique].dateFinAmenagementObligatoire,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTypesAmenagementByCategories
// ---------------------------------------------------------------------------

// Données de test minimales
const cat1 = { "@id": "/categories/1" } as never;
const cat2 = { "@id": "/categories/2" } as never;

const taPedaActif = {
  "@id": "/types/1",
  categorie: "/categories/1",
  actif: true,
  pedagogique: true,
  aideHumaine: false,
  examens: false,
} as never;
const taPedaInactif = {
  "@id": "/types/2",
  categorie: "/categories/1",
  actif: false,
  pedagogique: true,
  aideHumaine: false,
  examens: false,
} as never;
const taAideActif = {
  "@id": "/types/3",
  categorie: "/categories/2",
  actif: true,
  aideHumaine: true,
  pedagogique: false,
  examens: false,
} as never;
const taExamenActif = {
  "@id": "/types/4",
  categorie: "/categories/1",
  actif: true,
  examens: true,
  pedagogique: false,
  aideHumaine: false,
} as never;

describe("getTypesAmenagementByCategories", () => {
  it("exclut les types inactifs", () => {
    const result = getTypesAmenagementByCategories([cat1], [taPedaActif, taPedaInactif]);
    expect(result[0].typesAmenagements).toHaveLength(1);
    expect(result[0].typesAmenagements[0]["@id"]).toBe("/types/1");
  });

  it("filtre par domaine 'pedagogique'", () => {
    const result = getTypesAmenagementByCategories(
      [cat1, cat2],
      [taPedaActif, taAideActif],
      "pedagogique",
    );
    expect(result).toHaveLength(1);
    expect(result[0]["@id"]).toBe("/categories/1");
  });

  it("filtre par domaine 'aideHumaine'", () => {
    const result = getTypesAmenagementByCategories(
      [cat1, cat2],
      [taPedaActif, taAideActif],
      "aideHumaine",
    );
    expect(result).toHaveLength(1);
    expect(result[0]["@id"]).toBe("/categories/2");
  });

  it("filtre par domaine 'examen'", () => {
    const result = getTypesAmenagementByCategories(
      [cat1, cat2],
      [taPedaActif, taExamenActif],
      "examen",
    );
    expect(result).toHaveLength(1);
    expect(result[0].typesAmenagements[0]["@id"]).toBe("/types/4");
  });

  it("sans domaine : inclut tous les types actifs", () => {
    const result = getTypesAmenagementByCategories(
      [cat1, cat2],
      [taPedaActif, taPedaInactif, taAideActif],
    );
    // cat1 a 1 actif, cat2 a 1 actif
    expect(result).toHaveLength(2);
  });

  it("exclut les catégories sans types correspondants", () => {
    const result = getTypesAmenagementByCategories([cat2], [taPedaActif]);
    expect(result).toHaveLength(0);
  });

  it("retourne un tableau vide si aucune catégorie", () => {
    expect(getTypesAmenagementByCategories([], [taPedaActif])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getAmenagementsByCategories
// ---------------------------------------------------------------------------

const amenagement1 = { "@id": "/amenagements/1", typeAmenagement: "/types/1" } as never;
const amenagement2 = { "@id": "/amenagements/2", typeAmenagement: "/types/3" } as never;

describe("getAmenagementsByCategories", () => {
  it("regroupe les aménagements par catégorie et type", () => {
    const result = getAmenagementsByCategories([amenagement1], [cat1], [taPedaActif]);
    expect(result).toHaveLength(1);
    expect(result[0].typeAmenagements[0].amenagements).toHaveLength(1);
    expect(result[0].typeAmenagements[0].amenagements[0]["@id"]).toBe("/amenagements/1");
  });

  it("exclut les catégories sans aménagements", () => {
    const result = getAmenagementsByCategories([amenagement2], [cat1], [taPedaActif]);
    expect(result).toHaveLength(0);
  });

  it("filtre par domaine 'pedagogique'", () => {
    // taAideActif est dans cat2, taPedaActif dans cat1
    const result = getAmenagementsByCategories(
      [amenagement1, amenagement2],
      [cat1, cat2],
      [taPedaActif, taAideActif],
      "pedagogique",
    );
    expect(result).toHaveLength(1);
    expect(result[0]["@id"]).toBe("/categories/1");
  });

  it("retourne un tableau vide si aucune catégorie", () => {
    expect(getAmenagementsByCategories([amenagement1], [], [taPedaActif])).toEqual([]);
  });
});
