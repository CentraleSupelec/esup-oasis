/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ColumnType } from "antd/es/table";
import { Evenement, RoleValues } from "@lib";
import dayjs from "dayjs";
import { CampusItem } from "@controls/Items/CampusItem";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { EvenementIconeEnvoiRhItem } from "@controls/Items/EvenementIconeEnvoiRhItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import { Button, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import React from "react";

interface TableCalendarColumnsProps {
  saisieEvtRenfort?: boolean;
  afficherEtatEnvoiRh?: boolean;
  onEvenementSelected?: (evenement: Evenement) => void;
}

export function evenementTableColumns({
  saisieEvtRenfort = false,
  afficherEtatEnvoiRh = false,
  onEvenementSelected,
}: TableCalendarColumnsProps): ColumnType<Evenement>[] {
  return [
    {
      title: "Date",
      dataIndex: "debut",
      key: "debut",
      render: (date: Date, record: Evenement) => {
        return (
          <>
            {dayjs(date).format("DD/MM/YYYY")}
            <br />
            <span className="text-legende">
              {dayjs(record.debut).format("HH:mm")} à {dayjs(record.fin).format("HH:mm")}
            </span>
          </>
        );
      },
    },
    {
      title: "Libellé",
      dataIndex: "libelle",
      key: "libelle",
      responsive: ["md"],
    },
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
      title: "Bénéficiaires",
      dataIndex: "beneficiaires",
      key: "beneficiaires",
      render: (beneficiaires: string[]) => {
        return (
          <Space orientation="vertical">
            {beneficiaires.map((b) => (
              <EtudiantItem
                key={b}
                utilisateurId={b}
                responsive="lg"
                role={RoleValues.ROLE_BENEFICIAIRE}
              />
            ))}
          </Space>
        );
      },
    },
    saisieEvtRenfort
      ? {}
      : {
          title: "Intervenant",
          dataIndex: "intervenant",
          key: "intervenant",
          render: (intervenant: string) => {
            return (
              <EtudiantItem
                utilisateurId={intervenant}
                responsive="lg"
                role={RoleValues.ROLE_INTERVENANT}
              />
            );
          },
        },
    saisieEvtRenfort
      ? {}
      : {
          title: "Campus",
          dataIndex: "campus",
          key: "campus",
          responsive: ["xl"],
          render: (campus: string) => {
            return <CampusItem campusId={campus} responsive="lg" />;
          },
        },
    afficherEtatEnvoiRh
      ? {
          title: "Transmis RH",
          dataIndex: "dateEnvoiRH",
          className: "text-center",
          key: "dateEnvoiRH",
          responsive: ["lg"],
          render: (_data: boolean, record: Evenement) => {
            return <EvenementIconeEnvoiRhItem evenement={record} />;
          },
        }
      : {},
    {
      title: "",
      key: "actions",
      className: "text-right",
      render: (_value, record) => {
        return (
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              onEvenementSelected?.(record);
            }}
          >
            Voir
          </Button>
        );
      },
    },
  ];
}
