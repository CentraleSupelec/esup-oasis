/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ICategorieTag, PREFETCH_CATEGORIES_TAGS } from "@api";
import { useApi } from "@context/api/ApiProvider";
import { Button, Space, Switch, Table } from "antd";
import BooleanState from "@controls/State/BooleanState";
import { EditOutlined } from "@ant-design/icons";
import { Tags } from "@controls/Admin/Referentiel/Tags/Tags";
import React from "react";

export function CategoriesTagTable(props: {
  editedItem?: ICategorieTag;
  setEditedItem: (item?: ICategorieTag) => void;
}) {
  const [afficherDesactives, setAfficherDesactives] = React.useState<boolean>(false);
  const { data: categories, isFetching } = useApi().useGetFullCollection(PREFETCH_CATEGORIES_TAGS);

  return (
    <Table<ICategorieTag>
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
      loading={isFetching}
      dataSource={categories?.items.filter((item) => afficherDesactives || item.actif)}
      rowKey={(record) => record["@id"] as string}
      rowClassName={(record) => {
        if (!record.actif) {
          return "ref-inactif";
        }
        return record["@id"] === props.editedItem?.["@id"]
          ? "bg-primary-light shadow-1 border-0"
          : "";
      }}
      pagination={false}
      columns={[
        {
          title: "Catégorie",
          dataIndex: "libelle",
          key: "libelle",
        },
        {
          title: "État",
          dataIndex: "actif",
          key: "actif",
          width: 100,
          render: (actif) => <BooleanState value={actif} onLabel="Activé" offLabel="Désactivé" />,
        },
        {
          dataIndex: "commandes",
          key: "commandes",
          className: "text-right commandes",
          render: (_item, record) => (
            <Button
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                props.setEditedItem(record);
              }}
            >
              Éditer
            </Button>
          ),
        },
      ]}
      expandable={{
        expandRowByClick: true,
        expandedRowClassName: () => "bg-white",
        expandedRowRender: (record) => {
          return (
            <Tags categorieId={record["@id"] as string} afficherDesactives={afficherDesactives} />
          );
        },
      }}
    />
  );
}
