/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import { useModals } from "@context/modals/ModalsContext";
import Spinner from "@controls/Spinner/Spinner";
import { Table } from "antd";
import { Evenement } from "@lib";
import { evenementTableColumns } from "@controls/Table/EvenementTableColumns";

/**
 * Returns a table component that displays ongoing events.
 *
 * @returns {ReactElement} The table component displaying the ongoing events.
 */
export function EvenementsEnCoursTable(): ReactElement {
  const user = useAuth().user;
  const { setModalEvenementId } = useModals();
  const { data: evenementsEnCours, isLoading } = useApi().useGetFullCollection({
    path: "/evenements",
    query: {
      intervenant: user?.["@id"],
      "exists[periodePriseEnCompteRH]": false,
      "exists[dateAnnulation]": false,
    },
    enabled: !!user?.["@id"],
  });

  if (!evenementsEnCours) {
    return <Spinner />;
  }

  return (
    <Table<Evenement>
      dataSource={evenementsEnCours?.items.map((e) => new Evenement(e))}
      loading={isLoading}
      rowKey={(record) => record["@id"] as string}
      pagination={false}
      columns={evenementTableColumns({
        saisieEvtRenfort: false,
        afficherEtatEnvoiRh: false,
        onEvenementSelected: (evenement) => {
          setModalEvenementId(evenement["@id"] as string);
        },
      })}
    />
  );
}
