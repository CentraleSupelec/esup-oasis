/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { Button, Space, Switch, Table } from "antd";
import { EditOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { IClubSportif } from "@api";
import BooleanState from "@controls/State/BooleanState";

interface ClubsSportifsTableProps {
  editedItem?: IClubSportif;
  onEdit: (item: IClubSportif) => void;
}

export function ClubsSportifsTable({ editedItem, onEdit }: ClubsSportifsTableProps) {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [afficherDesactives, setAfficherDesactives] = React.useState<boolean>(false);

  const { data: clubsSportifs, isFetching } = useApi().useGetFullCollection({
    path: "/clubs_sportifs",
    query: {
      "order[libelle]": order,
    },
  });

  return (
    <Table<IClubSportif>
      caption={
        <div className="float-right mb-1">
          <Space>
            <Switch
              size="small"
              value={afficherDesactives}
              onChange={() => setAfficherDesactives(!afficherDesactives)}
            />
            <span>Afficher les valeurs désactivées</span>
          </Space>
        </div>
      }
      rowKey={(record) => record["@id"] as string}
      className="table-responsive"
      loading={isFetching}
      rowClassName={(record) => {
        if (!record.actif) {
          return "ref-inactif";
        }
        return record["@id"] === editedItem?.["@id"] ? "bg-primary-light shadow-1 border-0" : "";
      }}
      onChange={(_pagination, _filters, sorter) => {
        // tri
        if (Array.isArray(sorter)) {
          setOrder(sorter[0].order === "ascend" ? "asc" : "desc");
        } else {
          setOrder(sorter.order === "ascend" ? "asc" : "desc");
        }
      }}
      columns={[
        {
          title: "Libellé",
          dataIndex: "libelle",
          key: "libelle",
          sorter: true,
          defaultSortOrder: "ascend",
        },
        {
          title: "Centre formation",
          dataIndex: "centreFormation",
          width: 180,
          className: "text-center",
          responsive: ["lg"],
          key: "centreFormation",
          render: (value) => (
            <BooleanState
              value={value}
              showLabel={false}
              bordered={false}
              className="bg-transparent"
              onLabel="Oui"
              offLabel="Non"
            />
          ),
        },
        {
          title: "Professionnel",
          dataIndex: "professionnel",
          width: 180,
          className: "text-center",
          responsive: ["lg"],
          key: "professionnel",
          render: (value) => (
            <BooleanState
              value={value}
              showLabel={false}
              bordered={false}
              className="bg-transparent"
              onLabel="Oui"
              offLabel="Non"
            />
          ),
        },
        {
          title: "Actif",
          dataIndex: "actif",
          width: 120,
          className: "text-center",
          key: "actif",
          render: (actif) => <BooleanState value={actif} onLabel="Activé" offLabel="Désactivé" />,
        },
        {
          key: "actions",
          className: "text-right commandes",
          width: 150,
          render: (_, record) => (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                onEdit(record);
              }}
            >
              Éditer
            </Button>
          ),
        },
      ]}
      dataSource={[...(clubsSportifs?.items || [])].filter(
        (item) => afficherDesactives || item.actif,
      )}
      pagination={false}
    />
  );
}
