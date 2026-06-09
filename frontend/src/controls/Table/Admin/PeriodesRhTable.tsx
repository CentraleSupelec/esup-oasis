/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { Button, Space, Table } from "antd";
import { ServicesFaitsButton } from "@controls/Admin/Bilans/ServicesFaitsButton";
import { EditOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { IPeriode } from "@api";
import BooleanState from "@controls/State/BooleanState";

interface PeriodeRhTableProps {
  onEdit: (record: IPeriode) => void;
}

export function PeriodesRhTable({ onEdit }: PeriodeRhTableProps) {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const { data: periodes, isFetching } = useApi().useGetFullCollection({
    path: "/periodes",
    query: {
      "order[debut]": order,
    },
  });

  return (
    <Table<IPeriode>
      rowKey={(record) => record["@id"] as string}
      className="table-responsive"
      loading={isFetching}
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
          title: "Début période",
          dataIndex: "debutPeriode",
          key: "debut",
          sorter: true,
          defaultSortOrder: "descend",
          render: (_, record) => {
            return record.debut ? new Date(record.debut)?.toLocaleDateString("fr-FR") : null;
          },
        },
        {
          title: "Fin période",
          dataIndex: "finPeriode",
          key: "finPeriode",
          render: (_, record) => {
            return record.fin ? new Date(record.fin)?.toLocaleDateString("fr-FR") : null;
          },
        },
        {
          title: "Date butoir",
          dataIndex: "butoir",
          key: "butoir",
          render: (_, record) => {
            return record.butoir ? new Date(record.butoir)?.toLocaleDateString("fr-FR") : null;
          },
        },
        {
          title: "État",
          dataIndex: "envoyee",
          key: "envoyee",
          width: 100,
          className: "text-center",
          render: (_, record) => {
            return record.envoyee ? (
              <BooleanState value={record.envoyee} onLabel="Envoyée" />
            ) : null;
          },
        },
        {
          title: "Actions",
          key: "actions",
          className: "text-right",
          width: 150,
          render: (_, record) => (
            <Space size="middle">
              {record.envoyee && <ServicesFaitsButton showAfficher periode={record} />}
              <Button onClick={() => onEdit(record)} icon={<EditOutlined />}>
                Éditer
              </Button>
            </Space>
          ),
        },
      ]}
      dataSource={periodes?.items}
      pagination={false}
    />
  );
}
