/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Popconfirm, Space, Tooltip } from "antd";
import { RoleCalculeItem } from "@controls/Items/RoleCalculeItem";
import { RoleValues, Utilisateur } from "@lib";
import { IIntervenant, IUtilisateur } from "@api";
import { EyeOutlined, UserSwitchOutlined } from "@ant-design/icons";
import React from "react";
import { ColumnType } from "antd/es/table";
import { ascToAscend } from "@utils/array";
import { FilterProps } from "@utils/table";
import { FiltreIntervenant } from "@controls/Table/IntervenantTable";
import { stringOrDateToDate } from "@utils/dates";
import UtilisateurAvatarImage from "@controls/Avatars/UtilisateurAvatarImage";
import Highlighter from "react-highlight-words";
import { removeAccents } from "@utils/string";

import { UseStateDispatch } from "@utils/utils";
import { env } from "@/env";

interface TableIntervenantsColumnsProps {
  user: Utilisateur | undefined;
  filter: FiltreIntervenant;
  setFilter: UseStateDispatch<FiltreIntervenant>;
  onIntervenantSelected: (intervenant: IIntervenant) => void;
  onImpersonate: (uid: string) => void;
}

export function intervenantTableColumns({
  user,
  filter,
  setFilter,
  onIntervenantSelected,
  onImpersonate,
}: TableIntervenantsColumnsProps): ColumnType<IIntervenant>[] {
  function canImpersonate(intervenant: IIntervenant) {
    return (
      user?.isAdmin &&
      env.REACT_APP_ENVIRONMENT !== "production" &&
      (!intervenant.intervenantFin || stringOrDateToDate(intervenant.intervenantFin) > new Date())
    );
  }

  // noinspection JSUnusedGlobalSymbols
  const clickableCell = {
    className: "pointer",
    onCell: (record: IIntervenant) => {
      return {
        onClick: () => {
          onIntervenantSelected(record);
        },
      };
    },
  };

  return [
    {
      title: "Intervenant",
      dataIndex: "nom",
      fixed: "left",
      key: "nom",
      render: (_value, record) => {
        return (
          <Space>
            <UtilisateurAvatarImage
              as="img"
              utilisateur={record as IUtilisateur}
              width={48}
              size={48}
              role={RoleValues.ROLE_INTERVENANT}
              className="border-0"
              responsive="md"
            />
            <span>
              <span className="semi-bold">
                <Highlighter
                  textToHighlight={(record?.nom || "").toLocaleUpperCase()}
                  searchWords={[removeAccents(filter.nom ?? "")]}
                />
              </span>{" "}
              <span className="light">{record?.prenom}</span>
            </span>
          </Space>
        );
      },
      sortDirections: ["ascend", "descend"],
      sorter: true,
      defaultSortOrder: "ascend",
      sortOrder: ascToAscend(filter?.["order[nom]"]),
      ...FilterProps<FiltreIntervenant>("nom", filter, setFilter),
      filteredValue: filter?.nom ? [filter?.nom] : null,
      ...clickableCell,
    } as ColumnType<IIntervenant>,

    {
      title: "Renfort ?",
      key: "renfort",
      className: "text-center",
      width: 100,
      render: (_v, record) => {
        return (
          record.roles?.includes(RoleValues.ROLE_RENFORT) && (
            <RoleCalculeItem role={RoleValues.ROLE_RENFORT} />
          )
        );
      },
    },
    {
      key: "actions",
      className: "text-right",
      width: 115,
      render: (_value, record: IIntervenant) => (
        <Space>
          {canImpersonate(record) && (
            <Popconfirm
              title="Êtes-vous sûr de vouloir prendre l'identité de cet utilisateur ?"
              onConfirm={() => {
                onImpersonate(record.uid as string);
              }}
              okText="Oui"
              cancelText="Non"
              placement="left"
            >
              <Tooltip title="Prendre l'identité">
                <Button icon={<UserSwitchOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              onIntervenantSelected(record);
            }}
          >
            Voir
          </Button>
        </Space>
      ),
    },
  ];
}
