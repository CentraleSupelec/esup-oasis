/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import moment from "moment/moment";
import { RightOutlined } from "@ant-design/icons";
import React, { ReactElement } from "react";
import { stringOrDate } from "react-big-calendar";
import { TypeAffichageCustomValues } from "../redux/context/IAffichageFiltres";
import { Utilisateur } from "../lib/Utilisateur";
import dayjs from "dayjs";
import { IPeriode } from "../api/ApiTypeHelpers";

/**
 * Counts the number of days in a month for a given date.
 *
 * @param {Date} date - The date for which to count the number of days in the month.
 * @return {number} - The number of days in the month of the given date.
 */
export function countDaysInMonth(date: Date): number {
   return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Function to get the first day of the month from a given date.
 *
 * @param {Date} date - The input date.
 * @return {Date} The first day of the month.
 */
export function firstDayOfMonth(date: Date): Date {
   return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month for a given date.
 *
 * @param {Date} date - The input date.
 * @return {Date} - The last day of the month.
 */
export function lastDayOfMonth(date: Date): Date {
   return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Finds the first Monday before the given date.
 *
 * @param {Date} date - The date from which to find the first Monday before.
 * @return {Date} - The first Monday before the given date.
 */
export function firstMondayBefore(date: Date): Date {
   const day = date.getDay();
   const diff = date.getDate() - day + (day === 0 ? -6 : 1);
   return new Date(date.setDate(diff));
}

/**
 * Calculates the first Sunday date after the given date.
 *
 * @param {Date} date - The starting date.
 * @returns {Date} The first Sunday date after the given date.
 */
export function firstSundayAfter(date: Date): Date {
   const day = date.getDay();
   const diff = date.getDate() - day + (day === 0 ? 0 : 7);
   return new Date(date.setDate(diff));
}

/**
 * Returns the date of the first Friday after the given date.
 *
 * @param {Date} date - The starting date.
 * @return {Date} - The date of the first Friday after the given date.
 */
export function firstFridayAfter(date: Date): Date {
   const day = date.getDay();
   const diff = date.getDate() - day + 5;
   return new Date(date.setDate(diff));
}

/**
 * Checks if two dates are the same day, ignoring the time.
 *
 * @param {Date} date1 - The first date to compare.
 * @param {Date} date2 - The second date to compare.
 * @return {boolean} - True if the dates are the same day, otherwise false.
 */
export function isSameDay(date1: Date, date2: Date): boolean {
   return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
   );
}

/**
 * Converts a date range into a label for display.
 * @param {Date} debut - The start date of the range.
 * @param {Date} fin - The end date of the range.
 * @returns {ReactElement} - The label element.
 */
export const rangeToLabel = (debut: Date, fin: Date): ReactElement => {
   let from = moment(debut).format("DD");
   const to = moment(fin).format("DD MMMM YYYY");

   if (moment(debut).format("YYYY") !== moment(fin).format("YYYY")) {
      from = moment(debut).format("DD MMMM YYYY");
   } else if (moment(debut).format("MM") !== moment(fin).format("MM")) {
      from = moment(debut).format("DD MMMM");
   }

   if (isSameDay(debut, fin)) {
      return (
         <span aria-label={`Jour affiché : le ${moment(debut).format("DD MMMM YYYY")}`}>
            {moment(debut).format("DD MMMM YYYY")}
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
 * Calculates the range of dates based on the given start date and display type.
 *
 * @param {Date} debut - The start date of the range.
 * @param {string} affichage - The display type for the range. Possible values are "day", "work_week", "week", and "month".
 * @returns {{from: Date, to: Date}} - An object containing the calculated "from" and "to" dates.
 */
export const calculateRange = (
   debut: Date,
   affichage: TypeAffichageCustomValues,
): { from: Date; to: Date } => {
   let from = debut;
   let to: Date;

   switch (affichage) {
      case "day":
         to = from;
         break;
      case "work_week":
         from = firstMondayBefore(debut);
         to = firstFridayAfter(debut);
         break;
      case "week":
         from = firstMondayBefore(debut);
         to = firstSundayAfter(debut);
         break;
      case "month":
      default:
         from = firstDayOfMonth(debut);
         to = lastDayOfMonth(debut);
         break;
   }

   return { from, to };
};

/**
 * Converts a string or existing Date object to a Date object.
 *
 * @param {string | Date} date - The string or Date object to be converted.
 * @returns {Date} - The converted Date object.
 */
export const stringOrDateToDate = (date: stringOrDate): Date => {
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
export const stringOrDateToString = (date: stringOrDate): string => {
   if (typeof date === "string") {
      return date;
   }
   return date.toISOString();
};

/**
 * Counts the number of days based on the given affichage and date.
 *
 * @param {TypeAffichageCustomValues} affichage - The type of affichage (month, week, work_week, day)
 * @param {Date} date - The date for which to count the days.
 * @returns {number} - The number of days according to the affichage.
 */
export const affichageNbJours = (affichage: TypeAffichageCustomValues, date: Date): number => {
   let step = 0;
   switch (affichage) {
      case "month":
         step = countDaysInMonth(date);
         break;
      case "week":
      case "work_week":
         step = 7;
         break;
      case "day":
         step = 1;
         break;
   }
   return step;
};

export enum TypeOperationHeure {
   Inchangee = 0,
   debutJournee = 1,
   finJournee = 2,
}

/**
 * Creates a new Date object that represents the given date in UTC timezone.
 * Allow to set the hour to the beginning or the end of the day.
 *
 * @param {Date} date - The date to convert to UTC.
 * @param {TypeOperationHeure} [heure=TypeOperationHeure.Inchangee] - The hour type.
 * @return {Date} A new Date object representing the given date in UTC timezone.
 */
export function createDateAsUTC(
   date: Date,
   heure: TypeOperationHeure = TypeOperationHeure.Inchangee,
): Date {
   if (heure === TypeOperationHeure.debutJournee) {
      date.setHours(0, 0, 0, 0);
   }
   if (heure === TypeOperationHeure.finJournee) {
      date.setHours(23, 59, 59, 999);
   }

   return new Date(
      Date.UTC(
         date.getFullYear(),
         date.getMonth(),
         date.getDate(),
         date.getHours(),
         date.getMinutes(),
         date.getSeconds(),
      ),
   );
}

/**
 * Create a Date object in UTC timezone from a string representation.
 *
 * @param {string} date - The string representation of the date.
 * @param {TypeOperationHeure} heure - The type of operation to perform on the hour. Default value is TypeOperationHeure.Inchangee.
 * @return {Date} - The Date object in UTC timezone.
 */
export function createDateFromStringAsUTC(
   date: string,
   heure: TypeOperationHeure = TypeOperationHeure.Inchangee,
): Date {
   return createDateAsUTC(new Date(date), heure);
}

/**
 * Checks if a given value contains a valid date.
 *
 * @param {string | undefined} val - The value to check.
 * @return {boolean} - True if the value contains a valid date, false otherwise.
 */
export function isDateValid(val: string | undefined): boolean {
   if (!val) return false;
   const date = new Date(val);
   return !isNaN(date.getTime());
}

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
      return `jusqu'au ${moment(fin).format(`DD ${formatMois} YYYY`)}`;
   }

   if (!fin) {
      return `à compter du ${moment(debut).format(`DD ${formatMois} YYYY`)}`;
   }

   const dateDebut = new Date(debut);
   const dateFin = new Date(fin);

   if (dateDebut.getFullYear() === dateFin.getFullYear()) {
      if (dateDebut.getMonth() === dateFin.getMonth()) {
         return `${moment(dateDebut).format("DD")} au ${moment(dateFin).format(`DD ${formatMois} YYYY`)}`;
      }
      return `${moment(dateDebut).format(`DD ${formatMois}`)} au ${moment(dateFin).format(`DD ${formatMois} YYYY`)}`;
   }
   return `${moment(dateDebut).format(`DD ${formatMois} YYYY`)} au ${moment(dateFin).format(
      `DD ${formatMois} YYYY`,
   )}`;
}

/**
 * Checks if the current date is within the specified period.
 *
 * @param {string | undefined | null} debut - The start of the period.
 * @param {string | undefined | null} fin - The end of the period.
 * @returns {boolean} - Returns true if the current date is within the specified period, otherwise false.
 */
export function isEnCoursSurPeriode(
   debut: string | undefined | null,
   fin: string | undefined | null,
): boolean {
   if (!debut && !fin) return false;

   if (!debut) {
      return moment().isBefore(fin);
   }

   if (!fin) {
      return moment().isAfter(debut);
   }

   const dateDebut = new Date(debut);
   const dateFin = new Date(fin);

   return moment().isBetween(dateDebut, dateFin);
}

/**
 * Determines if an event can be created on a given date.
 *
 * @param {Date} date - The date to check for event creation.
 * @param {Utilisateur | undefined} user - The user's information.
 * @param {IPeriode | undefined} lastPeriode - The last period information.
 *
 * @returns {boolean} - True if the event can be created, false otherwise.
 */
export function canCreateEventOnDate(
   date: Date,
   user: Utilisateur | undefined,
   lastPeriode: IPeriode | undefined,
): boolean {
   if (!user) return false;

   // Admin peut tout faire
   if (user.isAdmin) return true;

   //Pas de période précédente
   if (!lastPeriode) return true;

   return dayjs(lastPeriode.butoir).endOf("day").isBefore(dayjs(date).startOf("day"));
}

export function calculerAge(dateNaissance: string) {
   return dayjs().diff(dayjs(dateNaissance), "year");
}
