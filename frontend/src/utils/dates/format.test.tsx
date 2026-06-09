/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { render, screen } from "@testing-library/react";
import {
  calculerAge,
  getLibellePeriode,
  rangeToLabel,
  stringOrDateToDate,
  stringOrDateToString,
} from "./format";

// Aligne la locale sur celle de l'application (App.tsx : dayjs.locale("fr"))
dayjs.locale("fr");

// ---------------------------------------------------------------------------
// stringOrDateToDate
// ---------------------------------------------------------------------------

describe("stringOrDateToDate", () => {
  it("retourne la même référence si l'entrée est déjà une Date", () => {
    const date = new Date(2024, 2, 15);
    expect(stringOrDateToDate(date)).toBe(date);
  });

  it("convertit une chaîne ISO en Date", () => {
    const result = stringOrDateToDate("2024-03-15");
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
  });

  it("convertit une chaîne datetime en Date", () => {
    const result = stringOrDateToDate("2024-03-15T10:30:00");
    expect(result).toBeInstanceOf(Date);
  });
});

// ---------------------------------------------------------------------------
// stringOrDateToString
// ---------------------------------------------------------------------------

describe("stringOrDateToString", () => {
  it("retourne la chaîne inchangée si l'entrée est déjà une chaîne", () => {
    expect(stringOrDateToString("2024-03-15")).toBe("2024-03-15");
  });

  it("convertit une Date en chaîne ISO via toISOString()", () => {
    const date = new Date("2024-03-15T10:30:00Z");
    expect(stringOrDateToString(date)).toBe(date.toISOString());
  });
});

// ---------------------------------------------------------------------------
// rangeToLabel
// ---------------------------------------------------------------------------

describe("rangeToLabel", () => {
  describe("jour unique (debut === fin)", () => {
    it("rend un <span> avec l'aria-label correct", () => {
      render(rangeToLabel(new Date(2024, 2, 15), new Date(2024, 2, 15)));
      expect(screen.getByLabelText("Jour affiché : le 15 mars 2024")).toBeInTheDocument();
    });

    it("affiche le texte formaté dans le span", () => {
      render(rangeToLabel(new Date(2024, 2, 15), new Date(2024, 2, 15)));
      expect(screen.getByText("15 mars 2024")).toBeInTheDocument();
    });
  });

  describe("plage dans le même mois", () => {
    it("affiche le jour seul dans .from", () => {
      const { container } = render(rangeToLabel(new Date(2024, 2, 1), new Date(2024, 2, 15)));
      expect(container.querySelector(".from")).toHaveTextContent("01");
    });

    it("affiche jour + mois + année dans .to", () => {
      const { container } = render(rangeToLabel(new Date(2024, 2, 1), new Date(2024, 2, 15)));
      expect(container.querySelector(".to")).toHaveTextContent("15 mars 2024");
    });

    it("utilise un aria-label de période", () => {
      render(rangeToLabel(new Date(2024, 2, 1), new Date(2024, 2, 15)));
      expect(screen.getByLabelText("Période affichée : du 01 au 15 mars 2024")).toBeInTheDocument();
    });
  });

  describe("plage sur des mois différents, même année", () => {
    it("inclut le mois dans .from", () => {
      const { container } = render(rangeToLabel(new Date(2024, 0, 1), new Date(2024, 2, 15)));
      expect(container.querySelector(".from")).toHaveTextContent("01 janvier");
    });

    it("n'inclut pas l'année dans .from", () => {
      const { container } = render(rangeToLabel(new Date(2024, 0, 1), new Date(2024, 2, 15)));
      expect(container.querySelector(".from")).not.toHaveTextContent("2024");
    });
  });

  describe("plage sur des années différentes", () => {
    it("inclut l'année dans .from", () => {
      const { container } = render(rangeToLabel(new Date(2023, 0, 1), new Date(2024, 2, 15)));
      expect(container.querySelector(".from")).toHaveTextContent("01 janvier 2023");
    });
  });
});

// ---------------------------------------------------------------------------
// getLibellePeriode
// ---------------------------------------------------------------------------

describe("getLibellePeriode", () => {
  it("retourne le libellé générique si debut et fin sont absents", () => {
    expect(getLibellePeriode(null, null)).toBe("- période non renseignée -");
    expect(getLibellePeriode(undefined, undefined)).toBe("- période non renseignée -");
  });

  it("retourne 'jusqu'au' si seulement fin est fournie", () => {
    expect(getLibellePeriode(null, "2024-03-15")).toBe("jusqu'au 15 mars 2024");
  });

  it("retourne 'à compter du' si seulement debut est fourni", () => {
    expect(getLibellePeriode("2024-03-15", null)).toBe("à compter du 15 mars 2024");
  });

  it("formate une plage dans le même mois : jour au jour mois année", () => {
    expect(getLibellePeriode("2024-03-01", "2024-03-15")).toBe("01 au 15 mars 2024");
  });

  it("formate une plage sur des mois différents, même année : jour mois au jour mois année", () => {
    expect(getLibellePeriode("2024-01-01", "2024-03-15")).toBe("01 janvier au 15 mars 2024");
  });

  it("formate une plage sur des années différentes : date complète au date complète", () => {
    expect(getLibellePeriode("2023-01-01", "2024-03-15")).toBe("01 janvier 2023 au 15 mars 2024");
  });

  it("utilise le formatMois court (MM) pour un format numérique", () => {
    expect(getLibellePeriode(null, "2024-03-15", "MM")).toBe("jusqu'au 15 03 2024");
  });
});

// ---------------------------------------------------------------------------
// calculerAge
// ---------------------------------------------------------------------------

describe("calculerAge", () => {
  // Date courante simulée : 15 juin 2024
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calcule l'âge correct pour un anniversaire déjà passé dans l'année", () => {
    expect(calculerAge("1990-03-15")).toBe(34); // mars passé → 2024 - 1990 = 34
  });

  it("calcule l'âge correct pour un anniversaire pas encore passé dans l'année", () => {
    expect(calculerAge("1990-12-25")).toBe(33); // décembre à venir → 2024 - 1990 - 1 = 33
  });

  it("retourne 0 le jour même de la naissance", () => {
    expect(calculerAge("2024-06-15")).toBe(0);
  });

  it("retourne 1 pour un enfant dont l'anniversaire est passé cette année", () => {
    expect(calculerAge("2023-01-01")).toBe(1);
  });
});
