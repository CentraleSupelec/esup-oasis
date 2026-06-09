/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { montantToString, to2Digits } from "./number";

// ---------------------------------------------------------------------------
// montantToString
// ---------------------------------------------------------------------------

describe("montantToString", () => {
  it("calcule heures × taux et formate avec virgule", () => {
    expect(montantToString("2", "15")).toBe("30,00");
  });

  it("applique le coefficient de charge", () => {
    // 2h × 10€ × 1.5 = 30,00
    expect(montantToString("2", "10", "1.5")).toBe("30,00");
  });

  it("retourne '0,00' si nbHeures est undefined", () => {
    expect(montantToString(undefined, "15")).toBe("0,00");
  });

  it("retourne '0,00' si tauxHoraire est undefined", () => {
    expect(montantToString("2", undefined)).toBe("0,00");
  });

  it("retourne '0,00' si tous les paramètres sont undefined", () => {
    expect(montantToString(undefined, undefined)).toBe("0,00");
  });

  it("arrondit à 2 décimales avec virgule", () => {
    expect(montantToString("1", "10.333")).toBe("10,33");
  });
});

// ---------------------------------------------------------------------------
// to2Digits
// ---------------------------------------------------------------------------

describe("to2Digits", () => {
  it("formate un nombre entier avec 2 décimales et virgule", () => {
    expect(to2Digits(10)).toBe("10,00");
  });

  it("formate une chaîne numérique", () => {
    expect(to2Digits("10.5")).toBe("10,50");
  });

  it("retourne la valeur par défaut si value est undefined", () => {
    expect(to2Digits(undefined)).toBe("0.00");
  });

  it("accepte une valeur par défaut personnalisée", () => {
    expect(to2Digits(undefined, "N/A")).toBe("N/A");
  });

  it("arrondit à 2 décimales", () => {
    expect(to2Digits(10.999)).toBe("11,00");
  });

  it("gère zéro", () => {
    expect(to2Digits(0)).toBe("0,00");
  });
});
