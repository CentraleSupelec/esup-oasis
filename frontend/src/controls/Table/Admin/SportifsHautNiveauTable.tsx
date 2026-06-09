/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { App, Button, Popconfirm, Space, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { ISportifHautNiveau, QK_SPORTIFS_HAUT_NIVEAU } from "@api";
import { ascendToAsc, ascToAscend } from "@utils/array";
import { FilterProps } from "@utils/table";
import { SorterResult } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { removeAccents } from "@utils/string";
import { ColumnsType } from "antd/lib/table";

interface SportifsHautNiveauTableProps {
  editedItem?: ISportifHautNiveau;
  onEdit: (item: ISportifHautNiveau) => void;
}

export type FiltreSportifsHautNiveau = {
  /** @description The collection page number */
  page?: number;
  /** @description The number of items per page */
  itemsPerPage?: number;
  "order[nom]"?: "asc" | "desc";
  nom?: string;
  prenom?: string;
  identifiantExterne?: string;
};

export function SportifsHautNiveauTable({ onEdit }: SportifsHautNiveauTableProps) {
  const { message } = App.useApp();
  const [filtre, setFiltre] = useState<FiltreSportifsHautNiveau>({
    page: 1,
    itemsPerPage: 25,
    "order[nom]": "asc",
  });

  const { data: sportifsHautNiveau, isFetching } = useApi().useGetFullCollection({
    path: "/sportifs_haut_niveau",
    query: filtre,
  });

  const mutationDelete = useApi().useDelete({
    path: "/sportifs_haut_niveau/{identifiantExterne}",
    invalidationQueryKeys: [QK_SPORTIFS_HAUT_NIVEAU],
    onSuccess: () => {
      message.success("Sportif supprimé").then();
    },
  });

  return (
    <Table<ISportifHautNiveau>
      rowKey={(record) => record["@id"] as string}
      className="table-responsive"
      loading={isFetching}
      onChange={(
        _pagination,
        filters,
        sorter: SorterResult<ISportifHautNiveau> | SorterResult<ISportifHautNiveau>[],
      ) => {
        setFiltre((prev) => ({
          ...prev,
        }));
        if (Array.isArray(sorter)) {
          return;
        }

        if (sorter.field && sorter.field === "nom") {
          setFiltre((prev) => ({
            ...prev,
            "order[nom]": ascendToAsc(sorter.order),
          }));
        }
      }}
      columns={
        [
          {
            title: "Nom",
            dataIndex: "nom",
            key: "nom",
            sortDirections: ["ascend", "descend"],
            sorter: true,
            defaultSortOrder: "ascend",
            sortOrder: ascToAscend(filtre?.["order[nom]"]),
            ...FilterProps<FiltreSportifsHautNiveau>("nom", filtre, setFiltre),
            filteredValue: filtre?.nom ? [filtre?.nom] : null,
            render: (nom) => (
              <Highlighter searchWords={[removeAccents(filtre.nom || "")]} textToHighlight={nom} />
            ),
          },
          {
            title: "Prénom",
            dataIndex: "prenom",
            key: "prenom",
            ...FilterProps<FiltreSportifsHautNiveau>("prenom", filtre, setFiltre),
            filteredValue: filtre?.prenom ? [filtre?.prenom] : null,
            render: (prenom) => (
              <Highlighter
                searchWords={[removeAccents(filtre.prenom || "")]}
                textToHighlight={prenom}
              />
            ),
          },
          {
            title: "Année naissance",
            dataIndex: "anneeNaissance",
            width: 200,
            className: "text-right",
            key: "anneeNaissance",
          },
          {
            title: "Identifiant sportif (PSQS)",
            dataIndex: "identifiantExterne",
            width: 250,
            className: "text-center",
            key: "identifiantExterne",
            ...FilterProps<FiltreSportifsHautNiveau>("identifiantExterne", filtre, setFiltre),
            filteredValue: filtre?.identifiantExterne ? [filtre?.identifiantExterne] : null,
            render: (identifiantExterne) => (
              <Typography.Text
                copyable={{
                  text: identifiantExterne,
                }}
              >
                <Tag className="code">
                  <Highlighter
                    searchWords={[filtre?.identifiantExterne || ""]}
                    textToHighlight={identifiantExterne}
                  />
                </Tag>
              </Typography.Text>
            ),
          },
          {
            key: "actions",
            className: "text-right commandes",
            width: 150,
            render: (_, record) => (
              <Space.Compact>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    onEdit(record);
                  }}
                >
                  Éditer
                </Button>
                <Popconfirm
                  title={`Supprimer ${record.nom} ${record.prenom} ?`}
                  onConfirm={() => {
                    mutationDelete.mutate({
                      "@id": `/sportifs_haut_niveau/${record.identifiantExterne}` as string,
                    });
                  }}
                >
                  <Button icon={<DeleteOutlined />} className="text-danger" />
                </Popconfirm>
              </Space.Compact>
            ),
          },
        ] as ColumnsType<ISportifHautNiveau>
      }
      dataSource={[...(sportifsHautNiveau?.items || [])]}
      pagination={{
        pageSize: filtre?.itemsPerPage || 50,
        total: sportifsHautNiveau?.totalItems,
        current: filtre?.page || 1,
        showTotal: (total, range) => (
          <div className="text-legende mr-1">
            {range[0]} à {range[1]} / {total}
          </div>
        ),
        showSizeChanger: true,
        pageSizeOptions: [25, 50, 100, 200],
        onChange: (p, ps) => {
          setFiltre((prev) => ({
            ...prev,
            page: p,
            itemsPerPage: ps,
          }));
        },
      }}
    />
  );
}
