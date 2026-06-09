/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import {
  ETAT_DEMANDE_EN_COURS,
  ETAT_DEMANDE_VALIDEE,
  ETATS_DEMANDES,
  getEtatDemande,
  getEtatDemandeIndex,
  getEtatDemandeInfo,
  getEtatDemandeOrdre,
} from "./demande";

// Mock de l'environnement pour garantir des IDs prévisibles
const { mockEnv } = vi.hoisted(() => ({
  mockEnv: { REACT_APP_API_PREFIX: "/api", REACT_APP_SERVICE: "Service Test" },
}));

vi.mock("@/env", () => ({
  get env() {
    return mockEnv;
  },
}));

// ---------------------------------------------------------------------------
// getEtatDemandeInfo
// ---------------------------------------------------------------------------

describe("getEtatDemandeInfo", () => {
  it("retourne les informations complètes pour un état existant", () => {
    const info = getEtatDemandeInfo(ETAT_DEMANDE_EN_COURS);
    expect(info).toBeDefined();
    expect(info?.id).toBe(ETAT_DEMANDE_EN_COURS);
    expect(info?.etape).toBe("A");
    expect(info?.ordre).toBe(0);
  });

  it("retourne undefined pour un identifiant d'état inconnu", () => {
    const info = getEtatDemandeInfo("http://api/etats_demandes/999");
    expect(info).toBeUndefined();
  });

  it("retourne undefined pour une valeur vide ou nulle", () => {
    expect(getEtatDemandeInfo("")).toBeUndefined();
    expect(getEtatDemandeInfo(null as unknown as string)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getEtatDemandeIndex
// ---------------------------------------------------------------------------

describe("getEtatDemandeIndex", () => {
  it("retourne l'index correct dans le tableau pour un état donné", () => {
    const index = getEtatDemandeIndex(ETAT_DEMANDE_EN_COURS);
    expect(index).toBe(0);

    const indexValidee = getEtatDemandeIndex(ETAT_DEMANDE_VALIDEE);
    // On vérifie qu'il est bien après le premier
    expect(indexValidee).toBeGreaterThan(0);
    expect(ETATS_DEMANDES[indexValidee].id).toBe(ETAT_DEMANDE_VALIDEE);
  });

  it("retourne -1 pour un état inexistant", () => {
    expect(getEtatDemandeIndex("inconnu")).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// getEtatDemandeOrdre
// ---------------------------------------------------------------------------

describe("getEtatDemandeOrdre", () => {
  it("retourne la valeur d'ordre pour un état existant", () => {
    expect(getEtatDemandeOrdre(ETAT_DEMANDE_EN_COURS)).toBe(0);
  });

  it("retourne 0 par défaut pour un état inconnu", () => {
    expect(getEtatDemandeOrdre("inconnu")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getEtatDemande (alias de getEtatDemandeInfo)
// ---------------------------------------------------------------------------

describe("getEtatDemande", () => {
  it.each(ETATS_DEMANDES.map((e) => e.id))(
    "retourne le même résultat que getEtatDemandeInfo pour l'état '%s'",
    (id) => {
      expect(getEtatDemande(id)).toEqual(getEtatDemandeInfo(id));
    },
  );

  it("fonctionne aussi pour un état inconnu", () => {
    expect(getEtatDemande("inconnu")).toEqual(getEtatDemandeInfo("inconnu"));
  });
});

// ---------------------------------------------------------------------------
// ETATS_DEMANDES (Intégrité du référentiel)
// ---------------------------------------------------------------------------

describe("ETATS_DEMANDES", () => {
  it("ne contient que des identifiants uniques", () => {
    const ids = ETATS_DEMANDES.map((e) => e.id);
    const setIds = new Set(ids);
    expect(setIds.size).toBe(ids.length);
  });

  it("est trié par ordre croissant pour garantir la logique des étapes UI", () => {
    const ordres = ETATS_DEMANDES.map((e) => e.ordre);
    const sortedOrdres = [...ordres].sort((a, b) => a - b);
    expect(ordres).toEqual(sortedOrdres);
  });

  it("chaque état possède une icône React définie", () => {
    ETATS_DEMANDES.forEach((etat) => {
      expect(etat.icone).toBeDefined();
      // Vérification basique qu'il s'agit d'un élément React
      expect(etat.icone.type).toBeDefined();
    });
  });

  it("utilise la variable d'environnement pour la description de l'attente accompagnement", () => {
    const etat = ETATS_DEMANDES.find((e) => e.id.endsWith("/10")); // ETAT_ATTENTE_ACCOMPAGNEMENT
    expect(etat?.description).toContain("Service Test");
  });
});
