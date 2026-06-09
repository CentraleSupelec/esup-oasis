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
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { ICategorieAmenagement, ITypeAmenagement } from "@api";
import BooleanState from "@controls/State/BooleanState";
import { TypesAmenagementsTable } from "@controls/Table/Admin/TypesAmenagementsTable";

interface CategoriesAmenagementsTableProps {
  editedItem?: ICategorieAmenagement;
  onEditCategorie: (item: ICategorieAmenagement) => void;
  onEditType: (item: ITypeAmenagement) => void;
}

export function CategoriesAmenagementsTable({
  editedItem,
  onEditCategorie,
  onEditType,
}: CategoriesAmenagementsTableProps) {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [afficherDesactives, setAfficherDesactives] = React.useState<boolean>(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const { data: categoriesAmenagements, isFetching } = useApi().useGetFullCollection({
    path: "/categories_amenagements",
    query: {
      "order[libelle]": order,
    },
  });

  return (
    <Table<ICategorieAmenagement>
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
          title: "Catégorie d'aménagement",
          dataIndex: "libelle",
          key: "libelle",
          render: (_type, record) => (
            <span
              className={
                expandedRowKeys.includes(record["@id"] as string) ? "semi-bold text-primary" : ""
              }
            >
              {record.libelle}
            </span>
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
              onClick={(event) => {
                event.stopPropagation();
                onEditCategorie(record);
              }}
            >
              Éditer
            </Button>
          ),
        },
      ]}
      dataSource={[...(categoriesAmenagements?.items || [])].filter(
        (v) => v.actif || afficherDesactives,
      )}
      pagination={false}
      expandable={{
        expandRowByClick: true,
        expandedRowKeys,
        expandedRowRender: (record) => {
          return (
            <div className="btb-1">
              <div className="text-right mb-1 mt-2">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditType({
                      libelle: "",
                      categorie: record["@id"] as string,
                    } as ITypeAmenagement);
                  }}
                >
                  Ajouter un type d'aménagement
                </Button>
              </div>
              <TypesAmenagementsTable
                categorieId={record["@id"] as string}
                onEdit={onEditType}
                afficherDesactives={afficherDesactives}
              />
            </div>
          );
        },
        onExpand: (expanded, record) => {
          if (expanded) {
            setExpandedRowKeys([record["@id"] as string]);
          } else {
            setExpandedRowKeys([]);
          }
        },
      }}
    />
  );
}
