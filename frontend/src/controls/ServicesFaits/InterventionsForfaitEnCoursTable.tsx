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
import Spinner from "@controls/Spinner/Spinner";
import { Table } from "antd";
import { IInterventionForfait } from "@api";
import dayjs from "dayjs";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";

/**
 * Returns a table component that displays ongoing events.
 *
 * @returns {ReactElement} The table component displaying the ongoing events.
 */
export function InterventionsForfaitEnCoursTable(): ReactElement {
  const user = useAuth().user;
  const { data: interventionsEnCours, isLoading } = useApi().useGetFullCollection({
    path: "/interventions_forfait",
    query: {
      intervenant: user?.["@id"],
      "periode.debut[before]": dayjs().format("YYYY-MM-DD"),
      "periode.fin[strictly_after]": dayjs().format("YYYY-MM-DD"),
    },
    enabled: !!user?.["@id"],
  });

  if (!interventionsEnCours) {
    return <Spinner />;
  }

  return (
    <Table<IInterventionForfait>
      dataSource={interventionsEnCours?.items}
      loading={isLoading}
      rowKey={(record) => record["@id"] as string}
      pagination={false}
      columns={[
        {
          title: "Catégorie",
          dataIndex: "type",
          key: "type",
          responsive: ["md"],
          render: (typeEvenement: string) => {
            return <TypeEvenementItem typeEvenementId={typeEvenement} responsive="lg" />;
          },
        },
        {
          title: "Durée",
          dataIndex: "heures",
          key: "heures",
          render: (heures: number) => {
            return <>{heures} h</>;
          },
        },
      ]}
    />
  );
}
