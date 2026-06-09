/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ColumnType } from "antd/es/table";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { PeriodeRhItem } from "@controls/Items/PeriodeRhItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import { Button, Space, Tag, Tooltip } from "antd";
import { EditOutlined, EyeOutlined, FilterFilled, FilterOutlined } from "@ant-design/icons";
import React from "react";
import { FilterProps } from "@utils/table";
import { FiltreInterventionsForfait } from "@controls/Table/InterventionForfaitTable";
import { IInterventionForfait, IPeriode } from "@api";
import { RoleValues } from "@lib";
import { UseStateDispatch } from "@utils/utils";

interface TableInterventionForfaitColumnsProps {
  filter: FiltreInterventionsForfait;
  setFilter: UseStateDispatch<FiltreInterventionsForfait>;
  periodes?: IPeriode[];
  onEdit: (intervention: IInterventionForfait) => void;
}

function interventionForfaitTableColumns({
  filter,
  setFilter,
  periodes,
  onEdit,
}: TableInterventionForfaitColumnsProps): ColumnType<IInterventionForfait>[] {
  return [
    {
      title: "Période",
      dataIndex: "periode",
      render: (value) => <PeriodeRhItem periodeId={value} />,
      filters: periodes?.map((periode) => ({
        text: <PeriodeRhItem periodeId={periode["@id"]} />,
        value: periode["@id"] as string,
      })),
      filterIcon: () =>
        filter["periode[]"] ? <FilterFilled className="text-primary" /> : <FilterOutlined />,
    },
    {
      title: "Intervenant",
      dataIndex: "intervenant",
      sorter: true,
      defaultSortOrder: "ascend",
      render: (value) => <EtudiantItem utilisateurId={value} role={RoleValues.ROLE_INTERVENANT} />,
      ...FilterProps<FiltreInterventionsForfait>("nomIntervenant", filter, setFilter),
    } as ColumnType<IInterventionForfait>,
    {
      title: "Catégorie",
      dataIndex: "type",
      responsive: ["lg"],
      render: (value) => {
        return <TypeEvenementItem typeEvenementId={value} />;
      },
    },
    {
      title: "Durée",
      dataIndex: "heures",
      key: "heures",
      render: (v, record) => {
        return (
          <Space>
            {record.heures}
            <span>heures</span>
          </Space>
        );
      },
    },
    {
      title: "Bénéficiaires",
      dataIndex: "beneficiaires",
      responsive: ["lg"],
      render: (_v, record) => {
        if ((record.beneficiaires?.length || 0) === 0) {
          return <Tag color="orange">Aucun bénéficiaire associé</Tag>;
        }

        return (
          <Tag>
            {record.beneficiaires?.length} bénéficiaire
            {(record.beneficiaires?.length || 0) > 1 ? "s" : ""}
          </Tag>
        );
      },
    },
    {
      dataIndex: "actions",
      key: "actions",
      className: "text-right commandes",
      render: (_value, record) => {
        const periode = periodes?.find((p) => p["@id"] === record.periode);
        return (
          <Space size="middle">
            <Tooltip title={periode?.envoyee ? "Non modifiable car envoyé à la RH" : undefined}>
              {periode?.envoyee ? (
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => {
                    onEdit(record);
                  }}
                >
                  Voir
                </Button>
              ) : (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    onEdit(record);
                  }}
                >
                  Editer
                </Button>
              )}
            </Tooltip>
          </Space>
        );
      },
    },
  ];
}

export default interventionForfaitTableColumns;
