/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { APIPathsReferentiel } from "@api";
import { Button, Space, Switch, Table } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import ADMIN_CONFIG from "@routes/administration/AdminConfig";
import { IReferentielEditable } from "@lib";
import BooleanState from "@controls/State/BooleanState";

interface ReferentielTableProps {
  referentielConfig: (typeof ADMIN_CONFIG)[number];
  onEdit: (item: IReferentielEditable | undefined) => void;
  editedItem: IReferentielEditable | undefined;
}

export function ReferentielTable({ referentielConfig, onEdit, editedItem }: ReferentielTableProps) {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [afficherDesactives, setAfficherDesactives] = React.useState<boolean>(false);

  // --- API méthodes
  const { data, isFetching } = useApi().useGetFullCollection({
    path: referentielConfig?.apiPath as APIPathsReferentiel,
    query: {
      "order[libelle]": order,
    },
  });

  return (
    <Table
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
      rowClassName={(record) => {
        if (!record.actif) {
          return "ref-inactif";
        }
        return record["@id"] === editedItem?.["@id"] ? "bg-primary-light shadow-1 border-0" : "";
      }}
      dataSource={data?.items.filter((item) => afficherDesactives || item.actif)}
      loading={isFetching}
      pagination={{
        total: data?.totalItems,
        pageSize: data?.itemsPerPage,
        current: data?.currentPage,
        showTotal: (total, range) => (
          <div className="text-legende mr-1">
            {range[0]} à {range[1]} / {total}
          </div>
        ),
      }}
      onChange={(_pagination, _filters, sorter) => {
        // tri
        if (Array.isArray(sorter)) {
          setOrder(sorter[0].order === "ascend" ? "asc" : "desc");
        } else {
          setOrder(sorter.order === "ascend" ? "asc" : "desc");
        }
      }}
    >
      <Table.Column title="Libellé" dataIndex="libelle" sorter defaultSortOrder="ascend" />
      <Table.Column
        title="État"
        dataIndex="actif"
        className="text-center"
        render={(actif) => (
          <BooleanState
            value={actif}
            onLabel="Activé"
            offLabel="Désactivé"
            iconOn={<CheckOutlined aria-hidden />}
            iconOff={<CloseOutlined aria-hidden />}
          />
        )}
        width={100}
      />
      <Table.Column
        className="text-right commandes"
        width={150}
        render={(record) => (
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              onEdit(record);
            }}
          >
            Éditer
          </Button>
        )}
      />
    </Table>
  );
}
