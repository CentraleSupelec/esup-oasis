/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { capitalize, cleanUri, pluriel, removeAccents } from "./string";

// ---------------------------------------------------------------------------
// capitalize
// ---------------------------------------------------------------------------

describe("capitalize", () => {
  it("met en majuscule la première lettre d'une chaîne minuscule", () => {
    expect(capitalize("bonjour")).toBe("Bonjour");
  });

  it("ne modifie pas une chaîne déjà capitalisée", () => {
    expect(capitalize("Bonjour")).toBe("Bonjour");
  });

  it("ne touche pas au reste de la chaîne", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });

  it("gère une chaîne vide", () => {
    expect(capitalize("")).toBe("");
  });

  it("gère un seul caractère", () => {
    expect(capitalize("a")).toBe("A");
  });
});

// ---------------------------------------------------------------------------
// removeAccents
// ---------------------------------------------------------------------------

describe("removeAccents", () => {
  it("supprime les accents aigus", () => {
    expect(removeAccents("éàü")).toBe("eau");
  });

  it("supprime les accents sur les majuscules", () => {
    expect(removeAccents("Étudiant")).toBe("Etudiant");
  });

  it("ne modifie pas une chaîne sans accents", () => {
    expect(removeAccents("hello")).toBe("hello");
  });

  it("gère une chaîne vide", () => {
    expect(removeAccents("")).toBe("");
  });

  it("supprime la cédille", () => {
    expect(removeAccents("façon")).toBe("facon");
  });
});

// ---------------------------------------------------------------------------
// pluriel
// ---------------------------------------------------------------------------

describe("pluriel", () => {
  it("retourne le singulier pour n = 1", () => {
    expect(pluriel(1, "étudiant", "étudiants")).toBe("étudiant");
  });

  it("retourne le pluriel pour n = 2", () => {
    expect(pluriel(2, "étudiant", "étudiants")).toBe("étudiants");
  });

  it("retourne le pluriel pour n > 2", () => {
    expect(pluriel(100, "étudiant", "étudiants")).toBe("étudiants");
  });

  it("retourne le singulier pour n = 0", () => {
    expect(pluriel(0, "étudiant", "étudiants")).toBe("étudiant");
  });

  it("retourne le singulier pour n négatif", () => {
    expect(pluriel(-1, "étudiant", "étudiants")).toBe("étudiant");
  });
});

// ---------------------------------------------------------------------------
// cleanUri
// ---------------------------------------------------------------------------

describe("cleanUri", () => {
  it("supprime les barres obliques et chiffres préservés d'une IRI", () => {
    expect(cleanUri("/api/utilisateurs/123")).toBe("apiutilisateurs123");
  });

  it("ne modifie pas une chaîne alphanumérique", () => {
    expect(cleanUri("abc123")).toBe("abc123");
  });

  it("supprime les espaces et caractères spéciaux", () => {
    expect(cleanUri("hello world! #foo")).toBe("helloworldfoo");
  });

  it("gère une chaîne vide", () => {
    expect(cleanUri("")).toBe("");
  });

  it("supprime les tirets et underscores", () => {
    expect(cleanUri("foo-bar_baz")).toBe("foobarbaz");
  });
});
