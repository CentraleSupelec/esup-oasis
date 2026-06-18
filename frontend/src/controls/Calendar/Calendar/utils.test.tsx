/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { getWeekHeader, getMonthHeader } from "./utils";

const AUTRE_JOUR = new Date(2020, 2, 5); // 5 mars 2020 (jamais "aujourd'hui")

describe("getWeekHeader", () => {
  it("aujourd'hui : affiche le repère du jour courant", () => {
    const { container } = render(getWeekHeader(new Date(), false));
    expect(container.querySelector(".today-carret")).not.toBeNull();
  });

  it("autre jour : pas de repère du jour courant", () => {
    const { container } = render(getWeekHeader(AUTRE_JOUR, false));
    expect(container.querySelector(".today-carret")).toBeNull();
  });

  it("journée verrouillée : affiche l'icône cadenas", () => {
    const { container } = render(getWeekHeader(AUTRE_JOUR, true));
    expect(container.querySelector(".anticon-lock")).not.toBeNull();
  });

  it("journée non verrouillée : pas de cadenas", () => {
    const { container } = render(getWeekHeader(AUTRE_JOUR, false));
    expect(container.querySelector(".anticon-lock")).toBeNull();
  });

  it("affiche la date au format jour/mois (indépendant de la locale)", () => {
    const { container } = render(getWeekHeader(AUTRE_JOUR, false));
    expect(container.querySelector(".date")?.textContent).toContain("5/03");
  });

  it("expose un libellé accessible contenant le numéro de jour", () => {
    const { container } = render(getWeekHeader(AUTRE_JOUR, false));
    expect(container.querySelector(".date")?.getAttribute("aria-label")).toContain("5");
  });
});

describe("getMonthHeader", () => {
  it("aujourd'hui : affiche le repère du jour courant", () => {
    const { container } = render(getMonthHeader(new Date()));
    expect(container.querySelector(".today-carret")).not.toBeNull();
  });

  it("autre jour : pas de repère du jour courant", () => {
    const { container } = render(getMonthHeader(AUTRE_JOUR));
    expect(container.querySelector(".today-carret")).toBeNull();
  });
});
