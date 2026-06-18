import { describe, it, expect } from "vitest";
import * as QK from "./queryKeys";

// ---------------------------------------------------------------------------
// Contrat de non-régression sur les clés de cache React Query.
// Une collision ou une clé vide invaliderait silencieusement plusieurs
// requêtes à la fois (le mécanisme d'invalidation se base sur startsWith).
// ---------------------------------------------------------------------------

describe("queryKeys", () => {
  const entries = Object.entries(QK) as [string, string][];

  it("toutes les constantes QK_* sont des chaînes non vides", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value, `${name} doit être une string`).toBe("string");
      expect(value.length, `${name} ne doit pas être vide`).toBeGreaterThan(0);
    }
  });

  it("toutes les constantes QK_* sont uniques (pas de doublon)", () => {
    const values = entries.map(([, v]) => v);
    const unique = new Set(values);
    if (unique.size !== values.length) {
      const seen = new Set<string>();
      const duplicates = values.filter((v) => (seen.has(v) ? true : !seen.add(v)));
      throw new Error(`Doublons détectés : ${duplicates.join(", ")}`);
    }
    expect(unique.size).toBe(values.length);
  });

  it("toutes les clés commencent par '/' (condition du matching handleInvalidation)", () => {
    // handleInvalidation ignore les segments de queryKey qui ne commencent pas par '/'.
    for (const [name, value] of entries) {
      expect(value.startsWith("/"), `${name} doit commencer par '/'`).toBe(true);
    }
  });

  it("aucune clé n'a de slash final (sémantique startsWith cohérente)", () => {
    for (const [name, value] of entries) {
      expect(value.endsWith("/"), `${name} ne doit pas finir par '/'`).toBe(false);
    }
  });

  it("les placeholders {…} occupent toujours un segment de chemin entier", () => {
    // Un placeholder partiel (ex. '/foo{id}') casserait le matching par préfixe de segment.
    for (const [name, value] of entries) {
      for (const segment of value.split("/")) {
        if (segment.includes("{")) {
          expect(segment, `${name} : placeholder partiel dans « ${segment} »`).toMatch(
            /^\{[^/{}]+\}$/,
          );
        }
      }
    }
  });

  it("invariant anti-collision : un préfixe ne matche jamais un faux frère (ex. /tags ↛ /tags2)", () => {
    // handleInvalidation matche par startsWith : si A est préfixe de B, B doit être une
    // vraie sous-ressource (A + '/'), jamais un sibling partiel comme « /parametres » vs « /parametres_ui ».
    const values = entries.map(([, v]) => v);
    for (const a of values) {
      for (const b of values) {
        if (a !== b && b.startsWith(a)) {
          expect(
            b[a.length],
            `« ${a} » est un préfixe partiel de « ${b} » → invalidation involontaire`,
          ).toBe("/");
        }
      }
    }
  });

  it("les sous-ressources d'utilisateurs cascadent depuis QK_UTILISATEURS", () => {
    // Invalider la collection « /utilisateurs » doit aussi atteindre l'item et ses sous-ressources.
    const sousRessources = [
      QK.QK_UTILISATEURS_ITEM,
      QK.QK_UTILISATEURS_AMENAGEMENTS,
      QK.QK_UTILISATEURS_AVIS_ESE,
      QK.QK_UTILISATEURS_DEMANDES,
      QK.QK_UTILISATEURS_TAGS,
    ];
    for (const sr of sousRessources) {
      expect(sr.startsWith(`${QK.QK_UTILISATEURS}/`)).toBe(true);
    }
  });
});
