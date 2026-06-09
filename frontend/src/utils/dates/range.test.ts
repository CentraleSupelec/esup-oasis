/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  affichageNbJours,
  calculateRange,
  countDaysInMonth,
  firstDayOfMonth,
  firstFridayAfter,
  firstMondayBefore,
  firstSundayAfter,
  isSameDay,
  isEnCoursSurPeriode,
  lastDayOfMonth,
} from "./range";

// Référence : semaine du 11 au 17 mars 2024
// Lun 11, Mar 12, Mer 13, Jeu 14, Ven 15, Sam 16, Dim 17

describe("countDaysInMonth", () => {
  it("retourne 31 pour janvier", () => {
    expect(countDaysInMonth(new Date(2024, 0, 15))).toBe(31);
  });

  it("retourne 29 pour février en année bissextile", () => {
    expect(countDaysInMonth(new Date(2024, 1, 15))).toBe(29);
  });

  it("retourne 28 pour février en année non-bissextile", () => {
    expect(countDaysInMonth(new Date(2023, 1, 15))).toBe(28);
  });

  it("retourne 30 pour avril", () => {
    expect(countDaysInMonth(new Date(2024, 3, 15))).toBe(30);
  });
});

describe("firstDayOfMonth", () => {
  it("retourne le 1er mars depuis le 15 mars", () => {
    const result = firstDayOfMonth(new Date(2024, 2, 15));
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(1);
  });

  it("retourne le 1er depuis le dernier jour du mois", () => {
    const result = firstDayOfMonth(new Date(2024, 2, 31));
    expect(result.getDate()).toBe(1);
  });
});

describe("lastDayOfMonth", () => {
  it("retourne le 31 mars", () => {
    const result = lastDayOfMonth(new Date(2024, 2, 1));
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(31);
  });

  it("retourne le 29 février en année bissextile", () => {
    const result = lastDayOfMonth(new Date(2024, 1, 10));
    expect(result.getDate()).toBe(29);
  });

  it("retourne le 28 février en année non-bissextile", () => {
    const result = lastDayOfMonth(new Date(2023, 1, 10));
    expect(result.getDate()).toBe(28);
  });
});

describe("firstMondayBefore", () => {
  it("retourne le même jour si c'est déjà un lundi", () => {
    const result = firstMondayBefore(new Date(2024, 2, 11)); // lundi 11
    expect(result.getDate()).toBe(11);
    expect(result.getDay()).toBe(1);
  });

  it("retourne le lundi précédent depuis un mercredi", () => {
    const result = firstMondayBefore(new Date(2024, 2, 13)); // mercredi 13
    expect(result.getDate()).toBe(11);
    expect(result.getDay()).toBe(1);
  });

  it("retourne le lundi précédent depuis un dimanche", () => {
    const result = firstMondayBefore(new Date(2024, 2, 17)); // dimanche 17
    expect(result.getDate()).toBe(11);
    expect(result.getDay()).toBe(1);
  });

  it("retourne le lundi précédent depuis un samedi", () => {
    const result = firstMondayBefore(new Date(2024, 2, 16)); // samedi 16
    expect(result.getDate()).toBe(11);
    expect(result.getDay()).toBe(1);
  });
});

describe("firstSundayAfter", () => {
  it("retourne le même jour si c'est déjà un dimanche", () => {
    const result = firstSundayAfter(new Date(2024, 2, 17)); // dimanche 17
    expect(result.getDate()).toBe(17);
    expect(result.getDay()).toBe(0);
  });

  it("retourne le dimanche suivant depuis un lundi", () => {
    const result = firstSundayAfter(new Date(2024, 2, 11)); // lundi 11
    expect(result.getDate()).toBe(17);
    expect(result.getDay()).toBe(0);
  });

  it("retourne le dimanche suivant depuis un samedi", () => {
    const result = firstSundayAfter(new Date(2024, 2, 16)); // samedi 16
    expect(result.getDate()).toBe(17);
    expect(result.getDay()).toBe(0);
  });
});

describe("firstFridayAfter", () => {
  it("retourne le même jour si c'est déjà un vendredi", () => {
    const result = firstFridayAfter(new Date(2024, 2, 15)); // vendredi 15
    expect(result.getDate()).toBe(15);
    expect(result.getDay()).toBe(5);
  });

  it("retourne le vendredi depuis un lundi", () => {
    const result = firstFridayAfter(new Date(2024, 2, 11)); // lundi 11
    expect(result.getDate()).toBe(15);
    expect(result.getDay()).toBe(5);
  });

  it("retourne le vendredi depuis un mercredi", () => {
    const result = firstFridayAfter(new Date(2024, 2, 13)); // mercredi 13
    expect(result.getDate()).toBe(15);
    expect(result.getDay()).toBe(5);
  });
});

describe("isSameDay", () => {
  it("retourne true pour le même jour à des heures différentes", () => {
    expect(isSameDay(new Date(2024, 2, 15, 8, 0), new Date(2024, 2, 15, 20, 0))).toBe(true);
  });

  it("retourne false pour des jours consécutifs", () => {
    expect(isSameDay(new Date(2024, 2, 15), new Date(2024, 2, 16))).toBe(false);
  });

  it("retourne false pour le même jour de mois différents", () => {
    expect(isSameDay(new Date(2024, 2, 15), new Date(2024, 3, 15))).toBe(false);
  });

  it("retourne false pour le même jour d'années différentes", () => {
    expect(isSameDay(new Date(2023, 2, 15), new Date(2024, 2, 15))).toBe(false);
  });
});

describe("calculateRange", () => {
  it("day : from et to sont la date de départ", () => {
    const debut = new Date(2024, 2, 13); // mercredi 13 mars
    const { from, to } = calculateRange(debut, "day");
    expect(isSameDay(from, new Date(2024, 2, 13))).toBe(true);
    expect(isSameDay(to, new Date(2024, 2, 13))).toBe(true);
  });

  it("work_week : du lundi 11 au vendredi 15 depuis le mercredi 13", () => {
    const { from, to } = calculateRange(new Date(2024, 2, 13), "work_week");
    expect(from.getDate()).toBe(11);
    expect(from.getDay()).toBe(1);
    expect(to.getDate()).toBe(15);
    expect(to.getDay()).toBe(5);
  });

  it("week : du lundi 11 au dimanche 17 depuis le mercredi 13", () => {
    const { from, to } = calculateRange(new Date(2024, 2, 13), "week");
    expect(from.getDate()).toBe(11);
    expect(from.getDay()).toBe(1);
    expect(to.getDate()).toBe(17);
    expect(to.getDay()).toBe(0);
  });

  it("month : du 1er au 31 mars", () => {
    const { from, to } = calculateRange(new Date(2024, 2, 13), "month");
    expect(from.getMonth()).toBe(2);
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(2);
    expect(to.getDate()).toBe(31);
  });
});

describe("affichageNbJours", () => {
  it("retourne le nombre de jours du mois pour 'month' (mars = 31)", () => {
    expect(affichageNbJours("month", new Date(2024, 2, 1))).toBe(31);
  });

  it("retourne le nombre de jours du mois pour 'month' (février bissextile = 29)", () => {
    expect(affichageNbJours("month", new Date(2024, 1, 1))).toBe(29);
  });

  it("retourne 7 pour 'week'", () => {
    expect(affichageNbJours("week", new Date(2024, 2, 1))).toBe(7);
  });

  it("retourne 7 pour 'work_week'", () => {
    // work_week affiche 7 jours dans la grille ; les weekends sont masqués via CSS côté rendu
    expect(affichageNbJours("work_week", new Date(2024, 2, 1))).toBe(7);
  });

  it("retourne 1 pour 'day'", () => {
    expect(affichageNbJours("day", new Date(2024, 2, 1))).toBe(1);
  });
});

describe("isEnCoursSurPeriode", () => {
  // Date courante simulée : 15 juin 2024
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retourne false si debut et fin sont tous deux absents", () => {
    expect(isEnCoursSurPeriode(null, null)).toBe(false);
    expect(isEnCoursSurPeriode(undefined, undefined)).toBe(false);
  });

  it("retourne true si seulement fin est définie et est dans le futur", () => {
    expect(isEnCoursSurPeriode(null, "2024-12-31")).toBe(true);
  });

  it("retourne false si seulement fin est définie et est dans le passé", () => {
    expect(isEnCoursSurPeriode(null, "2024-01-01")).toBe(false);
  });

  it("retourne true si seulement debut est défini et est dans le passé", () => {
    expect(isEnCoursSurPeriode("2024-01-01", null)).toBe(true);
  });

  it("retourne false si seulement debut est défini et est dans le futur", () => {
    expect(isEnCoursSurPeriode("2024-12-31", null)).toBe(false);
  });

  it("retourne true si la date courante est au milieu de la période", () => {
    expect(isEnCoursSurPeriode("2024-01-01", "2024-12-31")).toBe(true);
  });

  it("retourne false si la date courante est avant la période", () => {
    expect(isEnCoursSurPeriode("2024-07-01", "2024-12-31")).toBe(false);
  });

  it("retourne false si la date courante est après la période", () => {
    expect(isEnCoursSurPeriode("2024-01-01", "2024-06-01")).toBe(false);
  });
});
