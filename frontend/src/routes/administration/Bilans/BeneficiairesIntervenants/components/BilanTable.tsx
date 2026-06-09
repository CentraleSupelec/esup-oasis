/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Card, Space, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { capitalize } from "@utils/string";
import { IActiviteBeneficiaire, IActiviteIntervenant } from "@api";
import { CampusItem } from "@controls/Items/CampusItem";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import { montantToString, to2Digits } from "@utils/number";
import { CoutCharge } from "@controls/Admin/Bilans/CoutCharge";
import { RoleValues } from "@lib";

export type IActivite = IActiviteBeneficiaire | IActiviteIntervenant;

interface BilanTableProps {
  type: "bénéficiaire" | "intervenant";
  loading: boolean;
  data?: IActivite[];
}

/**
 * Retrieves the columns for a Suivi table based on the given type.
 * @param {string} type - The type of table columns to retrieve. Valid values are "bénéficiaire" or "intervenant".
 * @return {Array<object>} - An array of column objects.
 */
function getTableColumns(type: "bénéficiaire" | "intervenant"): ColumnsType<IActivite> {
  return [
    {
      title: capitalize(type),
      dataIndex: "utilisateur",
      render: (_value, record: IActivite) => (
        <EtudiantItem
          utilisateur={record.utilisateur}
          showEmail
          role={
            type === "intervenant" ? RoleValues.ROLE_BENEFICIAIRE : RoleValues.ROLE_BENEFICIAIRE
          }
        />
      ),
    },
    {
      title: "Campus",
      dataIndex: "campus",
      render: (value: string) => value && <CampusItem campusId={value} />,
    },
    {
      title: "Catégorie d'événement",
      dataIndex: "type",
      render: (value: string) => <TypeEvenementItem typeEvenementId={value} forceBlackText />,
    },
    {
      title: "Nombre d'évènements",
      dataIndex: "nbEvenements",
      className: "text-right",
      render: (value: string) => {
        return <>{value}</>;
      },
    },
    {
      title: "Nombre d'heures",
      dataIndex: "nbHeures",
      className: "text-right",
      render: (value: string) => {
        return (
          <Space>
            {to2Digits(value)}
            <span>h</span>
          </Space>
        );
      },
    },
    {
      title: "Taux horaire",
      dataIndex: "tauxHoraire",
      className: "text-right",
      render: (_value, record: IActivite) => (
        <Space>
          {to2Digits(record.tauxHoraire?.montant)}
          <span>€</span>
        </Space>
      ),
    },
    {
      title: "Montant",
      dataIndex: "montant",
      className: "text-right",
      render: (_value: string, record: IActivite) => (
        <Space>
          {montantToString(record.nbHeures, record.tauxHoraire?.montant)}
          <span>€</span>
        </Space>
      ),
    },
    {
      title: "Coût chargé",
      dataIndex: "coutCharge",
      className: "text-right",
      render: (_value: string, record: IActivite) => (
        <Space>
          <CoutCharge activite={record} />
        </Space>
      ),
    },
  ];
}

export const BilanTable: React.FC<BilanTableProps> = ({ type, loading, data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card className="mt-3" loading={loading} title={`${capitalize(type)}s`}>
      <Table<IActivite>
        dataSource={data}
        columns={getTableColumns(type)}
        pagination={false}
        rowKey={(record) => record["@id"] as string}
      />
    </Card>
  );
};
