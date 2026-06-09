/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useMemo } from "react";
import { App, Layout } from "antd";
import CalendarSider from "@controls/Calendar/Sider/CalendarSider";
import Calendar from "@controls/Calendar/Calendar/Calendar";
import Toolbar from "@controls/Calendar/Toolbar/Toolbar";
import { Evenement } from "@lib";
import {
  ApiPathMethodQuery,
  IEvenement,
  PREFETCH_TYPES_EVENEMENTS,
  QK_EVENEMENTS,
  QK_STATISTIQUES_EVENEMENTS,
} from "@api";
import {
  filtrerEvenements,
  filtreToApi,
  PlanningLayout,
  useAffichageFiltres,
} from "@context/affichageFiltres/AffichageFiltresContext";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { calculateRange } from "@utils/dates";
import CalendarTable from "@controls/Calendar/Table/CalendarTable";
import { TimezoneAlert } from "@controls/Calendar/TimezoneAlert";

interface IComponentWithSider {
  saisieEvtRenfort?: boolean;
}

/**
 * A component for planning events with a sider.
 *
 * @param {IComponentWithSider} params - The parameters for the component.
 * @param {boolean} [params.saisieEvtRenfort=false] - Whether to allow entering reinforcement events.
 * @returns {ReactElement} - The rendered component.
 */
export default function PlanningWithSider({
  saisieEvtRenfort = false,
}: IComponentWithSider): ReactElement {
  const { message } = App.useApp();

  const { affichageFiltres: appAffichageFiltres, setFiltres } = useAffichageFiltres();
  // Get /types_evenements
  const { data: typesEvenements } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  // GET /evenements
  const { data: evenements, isFetching } = useApi().useGetFullCollection({
    path: "/evenements",
    query: filtreToApi(appAffichageFiltres.filtres) as ApiPathMethodQuery<"/evenements">,
  });

  // Mutation d'un évènement
  const mutateEvenement = useApi().usePatch({
    path: "/evenements/{id}",
    invalidationQueryKeys: [QK_EVENEMENTS, QK_STATISTIQUES_EVENEMENTS],
    onSuccess: () => {
      message.success("Évènement replanifié").then();
    },
  });

  const events = useMemo(
    () => evenements?.items.map((e: IEvenement) => new Evenement(e)) ?? [],
    [evenements],
  );

  // Persist de l'évènement modifié
  const setEvent = (event: Evenement) => {
    mutateEvenement?.mutate({
      "@id": event["@id"] as string,
      data: event,
    });
  };

  useEffect(() => {
    if (!appAffichageFiltres.filtres.type || appAffichageFiltres.filtres.type.length === 0) {
      setFiltres({
        type: typesEvenements?.items
          .filter((t) => t.visibleParDefaut)
          .filter((t) => t.actif)
          .map((t) => t["@id"] as string),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesEvenements]);

  // Ajustement de la plage de dates / affichage
  useEffect(() => {
    const range = calculateRange(
      appAffichageFiltres.filtres.debut,
      appAffichageFiltres.affichage.type,
    );

    setFiltres({ debut: range.from, fin: range.to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appAffichageFiltres.affichage.type]);

  const eventsFiltres = useMemo(() => {
    return filtrerEvenements(events, appAffichageFiltres.filtres);
  }, [events, appAffichageFiltres.filtres]);

  return (
    <Layout>
      <h1 className="sr-only">Planning</h1>
      <CalendarSider saisieEvtRenfort={saisieEvtRenfort} />
      <Layout.Content className="calendar-table-content">
        <Toolbar saisieEvtRenfort={saisieEvtRenfort} evenements={events} />
        <TimezoneAlert />
        {isFetching && (
          <div
            className="d-flex-center"
            style={{
              position: "fixed",
              top: 80,
              zIndex: 100,
              width: "100%",
              height: "calc(100vh - 80px)",
              backgroundColor: "#FFFFFFAA",
            }}
          >
            <Spinner size={100} />
          </div>
        )}
        {appAffichageFiltres.affichage.layout === PlanningLayout.calendar ? (
          <Calendar events={eventsFiltres} setEvent={setEvent} />
        ) : (
          <CalendarTable events={eventsFiltres} saisieEvtRenfort={saisieEvtRenfort} />
        )}
      </Layout.Content>
    </Layout>
  );
}
