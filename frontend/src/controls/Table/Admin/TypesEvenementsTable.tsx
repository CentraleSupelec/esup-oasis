/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { ITypeEvenement, PREFETCH_TYPES_EVENEMENTS } from "@api";
import { Button, Space, Switch, Table } from "antd";
import { TypeEvenementAvatar } from "@controls/Avatars/TypeEvenementAvatar";
import { EditOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import BooleanState from "@controls/State/BooleanState";

interface TypesEvenementsTableProps {
  editedItem?: ITypeEvenement;
  onEdit: (record: ITypeEvenement | undefined) => void;
}

export function TypesEvenementsTable({ onEdit, editedItem }: TypesEvenementsTableProps) {
  const [afficherDesactives, setAfficherDesactives] = React.useState<boolean>(false);
  const { data: typesEvenements, isFetching } =
    useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  function handleEdition(record: ITypeEvenement) {
    onEdit(undefined);
    onEdit(record);
  }

  useEffect(() => {
    // Comportement étrange lors de l'ajout d'un taux horaire... Bypass
    if (editedItem) {
      const itemApi = typesEvenements?.items?.find((item) => item["@id"] === editedItem["@id"]);
      if (itemApi?.tauxHoraires?.length !== editedItem.tauxHoraires?.length) {
        onEdit(itemApi);
      }
    }
  }, [typesEvenements, editedItem, onEdit]);

  return (
    <Table<ITypeEvenement>
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
      columns={[
        {
          dataIndex: "couleur",
          width: 65,
          key: "couleur",
          render: (_, record) => {
            return <TypeEvenementAvatar typeEvenement={record} />;
          },
        },
        {
          title: "Libellé",
          dataIndex: "libelle",
          key: "libelle",
        },
        {
          title: "État",
          dataIndex: "actif",
          width: 120,
          className: "text-center",
          key: "actif",
          render: (actif) => <BooleanState value={actif} onLabel="Activé" offLabel="Désactivé" />,
        },
        {
          title: "Visibilité par défaut",
          dataIndex: "visibleParDefaut",
          width: 190,
          className: "text-center",
          responsive: ["lg"],
          key: "visibleParDefaut",
          render: (visibleParDefaut) => (
            <BooleanState
              value={visibleParDefaut}
              onLabel="Visible"
              offLabel="Masqué"
              className="bg-transparent"
              bordered={false}
              showLabel={false}
            />
          ),
        },
        {
          title: "Au forfait",
          dataIndex: "forfait",
          width: 120,
          className: "text-center",
          responsive: ["lg"],
          key: "forfait",
          render: (forfait) => (
            <BooleanState
              value={forfait}
              className="bg-transparent"
              bordered={false}
              showLabel={false}
              onLabel="Oui"
              offLabel="Non"
            />
          ),
        },
        {
          key: "actions",
          className: "text-right commandes",
          width: 150,
          render: (_, record) => (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                handleEdition(record);
              }}
            >
              Éditer
            </Button>
          ),
        },
      ]}
      dataSource={[...(typesEvenements?.items || [])].filter((v) => v.actif || afficherDesactives)}
      pagination={false}
    />
  );
}
