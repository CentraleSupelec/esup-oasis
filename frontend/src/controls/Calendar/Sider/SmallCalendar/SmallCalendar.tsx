/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect } from "react";
import { Calendar, Skeleton } from "antd";
import "@controls/Calendar/Sider/SmallCalendar/SmallCalendar.scss";
import SmallCalendarCell from "@controls/Calendar/Sider/SmallCalendar/SmallCalendarCell";
import dayjs, { Dayjs } from "dayjs";
import { calculateRange, isSameDay } from "@utils/dates";
import { useAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { useWait } from "@utils/Wait/useWait";

/**
 * Renders a small calendar component with selectable dates.
 * @returns {ReactElement} The small calendar component.
 */
export default function SmallCalendar(): ReactElement {
  const { affichageFiltres: appAffichageFiltres, setFiltres } = useAffichageFiltres();
  const wait = useWait(1500);

  // Dispatch du filtre de date
  function handleDayChange(value: Dayjs) {
    const range = calculateRange(value.toDate(), appAffichageFiltres.affichage.type);

    if (
      !isSameDay(appAffichageFiltres.filtres.debut, range.from) ||
      !isSameDay(appAffichageFiltres.filtres.fin, range.to)
    )
      setFiltres({ debut: range.from, fin: range.to });
  }

  // --- Rendre le composant accessible

  useEffect(() => {
    // Rendre les listes de changement de mois et d'année accessibles
    const listes = document.querySelectorAll(".ant-select-selection-search-input");
    listes[0]?.setAttribute("aria-label", "Sélectionner une année");
    listes[1]?.setAttribute("aria-label", "Sélectionner un mois");

    if (listes[0]?.getAttribute("aria-activedescendant")?.includes("_list_0")) {
      listes[0]?.removeAttribute("aria-activedescendant");
    }
    if (listes[1]?.getAttribute("aria-activedescendant")?.includes("_list_0")) {
      listes[1]?.removeAttribute("aria-activedescendant");
    }
  });

  // --- /Rendre le composant accessible ---

  return (
    <div className="m-auto mt-2 mb-2" style={{ width: 275 }}>
      {wait ? (
        <Skeleton paragraph={{ rows: 6 }} active />
      ) : (
        <Calendar
          value={dayjs(appAffichageFiltres.filtres.debut)}
          fullscreen={false}
          fullCellRender={(value) => {
            if (value.month() === dayjs(appAffichageFiltres.filtres.debut).month()) {
              return <SmallCalendarCell date={value} affichageFiltres={appAffichageFiltres} />;
            } else {
              return value.format("D");
            }
          }}
          onSelect={handleDayChange}
        />
      )}
    </div>
  );
}
