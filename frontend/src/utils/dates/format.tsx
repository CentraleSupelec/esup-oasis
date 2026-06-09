/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import dayjs from "dayjs";
import { RightOutlined } from "@ant-design/icons";
import { isSameDay } from "@utils/dates/range";

type StringOrDate = string | Date;

/**
 * Converts a string or existing Date object to a Date object.
 *
 * @param {string | Date} date - The string or Date object to be converted.
 * @returns {Date} - The converted Date object.
 */
export const stringOrDateToDate = (date: StringOrDate): Date => {
  if (typeof date === "string") {
    return new Date(date);
  }
  return date;
};

/**
 * Converts a date or a string representation of a date to a string.
 *
 * @param {string | Date} date - The date or string representation of a date to be converted.
 * @returns {string} - The converted date as a string.
 */
export const stringOrDateToString = (date: StringOrDate): string => {
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString();
};

/**
 * Converts a date range into a label for display.
 * @param {Date} debut - The start date of the range.
 * @param {Date} fin - The end date of the range.
 * @returns {ReactElement} - The label element.
 */
export const rangeToLabel = (debut: Date, fin: Date): ReactElement => {
  let from = dayjs(debut).format("DD");
  const to = dayjs(fin).format("DD MMMM YYYY");

  if (dayjs(debut).format("YYYY") !== dayjs(fin).format("YYYY")) {
    from = dayjs(debut).format("DD MMMM YYYY");
  } else if (dayjs(debut).format("MM") !== dayjs(fin).format("MM")) {
    from = dayjs(debut).format("DD MMMM");
  }

  if (isSameDay(debut, fin)) {
    return (
      <span aria-label={`Jour affiché : le ${dayjs(debut).format("DD MMMM YYYY")}`}>
        {dayjs(debut).format("DD MMMM YYYY")}
      </span>
    );
  }

  return (
    <div aria-label={`Période affichée : du ${from} au ${to}`}>
      <div>
        <span className="from">{from}</span>
        <span className="to">
          {" "}
          <RightOutlined className="fs-09" aria-hidden={true} /> {to}
        </span>
      </div>
    </div>
  );
};

/**
 * Returns the label for a given period.
 *
 * @param {string | undefined | null} debut - The start date of the period.
 * @param {string | undefined | null} fin - The end date of the period.
 *
 * @param formatMois
 * @returns {string} - The label for the period.
 *                   - "- période non renseignée -" if both start and end dates are not provided.
 *                   - "jusqu'au [formatted end date]" if only start date is not provided.
 *                   - "à compter du [formatted start date]" if only end date is not provided.
 *                   - "[formatted start date] au [formatted end date]" if start and end dates are provided and are in the same year and month.
 *                   - "[formatted start date] au [formatted end date]" if start and end dates are provided and are in different years or months.
 */
export function getLibellePeriode(
  debut: string | undefined | null,
  fin: string | undefined | null,
  formatMois = "MMMM",
): string {
  if (!debut && !fin) return "- période non renseignée -";

  if (!debut) {
    return `jusqu'au ${dayjs(fin).format(`DD ${formatMois} YYYY`)}`;
  }

  if (!fin) {
    return `à compter du ${dayjs(debut).format(`DD ${formatMois} YYYY`)}`;
  }

  const dateDebut = new Date(debut);
  const dateFin = new Date(fin);

  if (dateDebut.getFullYear() === dateFin.getFullYear()) {
    if (dateDebut.getMonth() === dateFin.getMonth()) {
      return `${dayjs(dateDebut).format("DD")} au ${dayjs(dateFin).format(`DD ${formatMois} YYYY`)}`;
    }
    return `${dayjs(dateDebut).format(`DD ${formatMois}`)} au ${dayjs(dateFin).format(`DD ${formatMois} YYYY`)}`;
  }
  return `${dayjs(dateDebut).format(`DD ${formatMois} YYYY`)} au ${dayjs(dateFin).format(
    `DD ${formatMois} YYYY`,
  )}`;
}

export function calculerAge(dateNaissance: string) {
  return dayjs().diff(dayjs(dateNaissance), "year");
}
