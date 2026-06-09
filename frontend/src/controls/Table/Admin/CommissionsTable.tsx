/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ICommission } from "@api";
import React, { useState } from "react";
import { Button, Table, Typography } from "antd";
import { CommissionsEditionMembres } from "@controls/Admin/Commissions/CommissionsEdition";
import BooleanState from "@controls/State/BooleanState";
import { EditOutlined } from "@ant-design/icons";

export function CommissionsTable(props: {
  commissions: ICommission[];
  editedItem?: ICommission;
  setEditedItem: (item?: ICommission) => void;
  setOrder: (order: "asc" | "desc") => void;
}) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(
    props.editedItem ? [props.editedItem?.["@id"] as string] : [],
  );

  return (
    <Table<ICommission>
      dataSource={props.commissions}
      rowKey={(record) => record["@id"] as string}
      rowClassName={(record) => {
        if (!record.actif) {
          return "ref-inactif";
        }
        return record["@id"] === props.editedItem?.["@id"]
          ? "bg-primary-light shadow-1 border-0"
          : "";
      }}
      onChange={(_pagination, _filters, sorter) => {
        // tri
        if (Array.isArray(sorter)) {
          props.setOrder(sorter[0].order === "ascend" ? "asc" : "desc");
        } else {
          props.setOrder(sorter.order === "ascend" ? "asc" : "desc");
        }
      }}
      expandable={{
        expandedRowKeys,
        onExpand: (expanded, record) => {
          if (expanded) {
            setExpandedRowKeys([record["@id"] as string]);
          } else {
            setExpandedRowKeys([]);
          }
        },
        expandRowByClick: true,
        expandedRowClassName: () => "bg-white",
        expandedRowRender: (record) => {
          return (
            <div>
              <CommissionsEditionMembres commissionId={record?.["@id"]} />
            </div>
          );
        },
      }}
      columns={[
        {
          title: "Commission",
          dataIndex: "libelle",
          key: "libelle",
          render: (text, record) => (
            <Typography.Text
              className={
                expandedRowKeys.includes(record["@id"] as string) ? "semi-bold text-primary" : ""
              }
            >
              {text}
            </Typography.Text>
          ),
          sorter: true,
          defaultSortOrder: "ascend",
        },
        {
          title: "État",
          dataIndex: "actif",
          width: 100,
          key: "actif",
          className: "text-center",
          render: (actif) => <BooleanState value={actif} onLabel="Activée" offLabel="Désactivée" />,
        },
        {
          dataIndex: "commandes",
          key: "commandes",
          width: 120,
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
    />
  );
}
