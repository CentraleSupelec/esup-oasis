/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Evenement } from "@lib";
import {
  filtreToApiOnBackend,
  IAffichageFiltres,
} from "@context/affichageFiltres/AffichageFiltresContext";
import dayjs from "dayjs";
import { isSameDay } from "@utils/dates";
import { useApi } from "@context/api/ApiProvider";
import { useAuth } from "@/auth/AuthProvider";
import { ApiPathMethodQuery } from "@api";

interface ISmallCalendarCellProps {
  date: dayjs.Dayjs;
  affichageFiltres: IAffichageFiltres;
}

/**
 * Represents a small calendar cell component.
 *
 * @param {object} props - The props for the component.
 * @param {dayjs.Dayjs} props.date - The date to display in the cell.
 * @param {IAffichageFiltres} props.affichageFiltres - The filters to apply to the events.
 *
 * @returns {ReactElement} - The rendered component.
 */
function SmallCalendarCell({ date, affichageFiltres }: ISmallCalendarCellProps): ReactElement {
  const user = useAuth().user;

  const { data: eventsMonth } = useApi().useGetCollectionPaginated({
    path: "/evenements",
    page: 1,
    itemsPerPage: 1000,
    query: {
      ...(filtreToApiOnBackend(affichageFiltres.filtres) as ApiPathMethodQuery<
        "/evenements",
        "get"
      >),
      "debut[after]": date.startOf("month").toISOString(),
      "fin[before]": date.endOf("month").toISOString(),
    },
  });

  function dayHasEventNonAffecte() {
    return eventsMonth?.items.some((ev) => {
      const event = new Evenement(ev);
      return (
        user?.isPlanificateur &&
        event.debutDate() &&
        isSameDay(date.toDate(), event.debutDate() as Date) &&
        !event.isAffecte()
      );
    });
  }

  function dayHasEvent() {
    return eventsMonth?.items.some((ev) => {
      const event = new Evenement(ev);
      return event.debutDate() && isSameDay(date.toDate(), event.debutDate() as Date);
    });
  }

  function getClassName() {
    let className = "";
    if (isSameDay(date.toDate(), new Date())) {
      className = "today";
    }

    if (
      date.endOf("day").isAfter(dayjs(affichageFiltres.filtres.debut).startOf("day")) &&
      date.startOf("day").isBefore(dayjs(affichageFiltres.filtres.fin).endOf("day"))
    ) {
      className += " bg-app";
    }

    if (isSameDay(date.toDate(), affichageFiltres.filtres.debut)) {
      className += " cell-start";
    }
    if (isSameDay(date.toDate(), affichageFiltres.filtres.fin)) {
      className += " cell-end";
    }

    if (dayHasEventNonAffecte()) {
      className += " has-event-warning";
    } else if (dayHasEvent()) {
      className += " has-event";
    }

    return className;
  }

  return (
    <div>
      <div className={`ant-picker-calendar-date-value ${getClassName()}`}>{date.format("D")}</div>
    </div>
  );
}

export default memo(
  SmallCalendarCell,
  (prev, next) =>
    prev.date.valueOf() === next.date.valueOf() &&
    prev.affichageFiltres.filtres === next.affichageFiltres.filtres,
);
