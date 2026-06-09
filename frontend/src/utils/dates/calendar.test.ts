/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IPeriode } from "@api/ApiTypeHelpers";
import { Utilisateur } from "@lib/Utilisateur";
import {
  canCreateEventOnDate,
  createDateAsUTC,
  createDateFromStringAsUTC,
  isDateValid,
  TypeOperationHeure,
} from "./calendar";

// Helpers pour créer des utilisateurs minimaux sans instancier la classe complète
const adminUser = { isAdmin: true } as unknown as Utilisateur;
const regularUser = { isAdmin: false } as unknown as Utilisateur;

describe("createDateAsUTC", () => {
  it("préserve les composantes locales de la date sans modification par défaut", () => {
    // Utilise les valeurs locales pour construire un timestamp UTC équivalent
    const date = new Date(2024, 2, 15, 10, 30, 45); // 15 mars 2024, 10h30m45s local
    const result = createDateAsUTC(date);
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(2);
    expect(result.getUTCDate()).toBe(15);
    expect(result.getUTCHours()).toBe(10);
    expect(result.getUTCMinutes()).toBe(30);
    expect(result.getUTCSeconds()).toBe(45);
  });

  it("fixe l'heure UTC à 00:00:00 avec debutJournee", () => {
    const date = new Date(2024, 2, 15, 14, 0, 0);
    const result = createDateAsUTC(date, TypeOperationHeure.debutJournee);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
  });

  it("fixe l'heure UTC à 23:59:59 avec finJournee", () => {
    const date = new Date(2024, 2, 15, 8, 0, 0);
    const result = createDateAsUTC(date, TypeOperationHeure.finJournee);
    expect(result.getUTCHours()).toBe(23);
    expect(result.getUTCMinutes()).toBe(59);
    expect(result.getUTCSeconds()).toBe(59);
  });

  it("ne change pas la date (jour/mois/année) avec debutJournee", () => {
    const date = new Date(2024, 2, 15, 14, 0, 0);
    const result = createDateAsUTC(date, TypeOperationHeure.debutJournee);
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(2);
    expect(result.getUTCDate()).toBe(15);
  });
});

describe("createDateFromStringAsUTC", () => {
  it("convertit une chaîne ISO en date UTC avec les mêmes composantes locales", () => {
    // "2024-03-15T10:30:00" est interprété comme heure locale
    const result = createDateFromStringAsUTC("2024-03-15T10:30:00");
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(2);
    expect(result.getUTCDate()).toBe(15);
    expect(result.getUTCHours()).toBe(10);
    expect(result.getUTCMinutes()).toBe(30);
  });

  it("applique debutJournee depuis une chaîne ISO", () => {
    const result = createDateFromStringAsUTC(
      "2024-03-15T14:00:00",
      TypeOperationHeure.debutJournee,
    );
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
  });

  it("applique finJournee depuis une chaîne ISO", () => {
    const result = createDateFromStringAsUTC("2024-03-15T08:00:00", TypeOperationHeure.finJournee);
    expect(result.getUTCHours()).toBe(23);
    expect(result.getUTCMinutes()).toBe(59);
    expect(result.getUTCSeconds()).toBe(59);
  });
});

describe("isDateValid", () => {
  it("retourne true pour une date ISO valide (date seule)", () => {
    expect(isDateValid("2024-03-15")).toBe(true);
  });

  it("retourne true pour une date ISO avec heure", () => {
    expect(isDateValid("2024-03-15T10:30:00")).toBe(true);
  });

  it("retourne true pour un format lisible", () => {
    expect(isDateValid("March 15, 2024")).toBe(true);
  });

  it("retourne false pour une chaîne non-date", () => {
    expect(isDateValid("not-a-date")).toBe(false);
  });

  it("retourne false pour une chaîne vide", () => {
    expect(isDateValid("")).toBe(false);
  });

  it("retourne false pour undefined", () => {
    expect(isDateValid(undefined)).toBe(false);
  });
});

describe("canCreateEventOnDate", () => {
  it("retourne false si l'utilisateur est undefined", () => {
    expect(canCreateEventOnDate(new Date(2025, 0, 1), undefined, undefined)).toBe(false);
  });

  it("retourne true pour un admin, quelle que soit la date", () => {
    const oldPeriode = { butoir: "2020-01-01" } as IPeriode;
    expect(canCreateEventOnDate(new Date(2019, 0, 1), adminUser, oldPeriode)).toBe(true);
    expect(canCreateEventOnDate(new Date(2025, 0, 1), adminUser, oldPeriode)).toBe(true);
  });

  it("retourne true pour un admin même sans période", () => {
    expect(canCreateEventOnDate(new Date(2025, 0, 1), adminUser, undefined)).toBe(true);
  });

  it("retourne true si aucune période n'est définie (non-admin)", () => {
    expect(canCreateEventOnDate(new Date(2025, 0, 1), regularUser, undefined)).toBe(true);
  });

  it("retourne true si la date est strictement après le butoir", () => {
    // butoir = 1er janvier, date = 2 janvier : le lendemain est autorisé
    const periode = { butoir: "2024-01-01" } as IPeriode;
    expect(canCreateEventOnDate(new Date(2024, 0, 2), regularUser, periode)).toBe(true);
  });

  it("retourne false si la date est le même jour que le butoir", () => {
    // endOf("day") du butoir n'est pas avant startOf("day") de la même date
    const periode = { butoir: "2024-06-15" } as IPeriode;
    expect(canCreateEventOnDate(new Date(2024, 5, 15), regularUser, periode)).toBe(false);
  });

  it("retourne false si la date est avant le butoir", () => {
    const periode = { butoir: "2024-12-31" } as IPeriode;
    expect(canCreateEventOnDate(new Date(2024, 0, 1), regularUser, periode)).toBe(false);
  });
});
