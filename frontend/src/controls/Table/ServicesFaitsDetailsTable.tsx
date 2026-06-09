/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Flex, Space, Table } from "antd";
import { IPeriode, IServicesFaits, IServicesFaitsLigne, ITauxHoraire } from "@api";
import { ServicesFaitsButton } from "@controls/Admin/Bilans/ServicesFaitsButton";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import React from "react";
import { montantToString, to2Digits } from "@utils/number";
import { RoleValues } from "@lib";

interface ServicesFaitsDetailsTableProps {
  isFetching?: boolean;
  servicesFaits: IServicesFaits;
  afficherIntervenant?: boolean;
  afficherExporter?: boolean;
}

export function getServicesFaitsColumns() {
  return [
    {
      title: "Intervenant",
      dataIndex: "intervenant",
      render: (value: string) => (
        <EtudiantItem utilisateurId={value} role={RoleValues.ROLE_INTERVENANT} showEmail />
      ),
    },
    {
      title: "Catégorie d'événement",
      dataIndex: "type",
      render: (value: string) => <TypeEvenementItem typeEvenementId={value} forceBlackText />,
    },
    {
      title: "Taux horaire",
      dataIndex: "tauxHoraire",
      className: "text-right",
      render: (value: ITauxHoraire) => (
        <Space>
          {value.montant.replace(".", ",")}
          <span>€</span>
        </Space>
      ),
    },
    {
      title: "Nombre d'heures",
      dataIndex: "nbHeures",
      className: "text-right",
      render: (value: string) => {
        return (
          <Space>
            {to2Digits(value)}
            <span>h</span>
          </Space>
        );
      },
    },
    {
      title: "Montant",
      dataIndex: "montant",
      className: "text-right",
      render: (_value: string, record: IServicesFaitsLigne) => (
        <Space>
          {montantToString(record.nbHeures, record.tauxHoraire?.montant)}
          <span>€</span>
        </Space>
      ),
    },
  ];
}

export function ServicesFaitsDetailsTable({
  isFetching = false,
  afficherIntervenant = true,
  afficherExporter = true,
  servicesFaits,
}: ServicesFaitsDetailsTableProps) {
  return (
    <>
      {afficherExporter && (
        <Flex justify="flex-end" align="center">
          <div className="text-right">
            <ServicesFaitsButton
              periode={servicesFaits.periode as IPeriode}
              showAfficher={false}
              label="Exporter"
            />
          </div>
        </Flex>
      )}
      <Table<IServicesFaitsLigne>
        className="mt-3"
        loading={isFetching}
        dataSource={servicesFaits?.lignes}
        pagination={false}
        scroll={{ x: "max-content" }}
        rowKey={(record) => `${record.intervenant}_${record.type}`}
        footer={() => (
          <div className="text-right">
            Montant total :{" "}
            <span className="semi-bold">
              {to2Digits(
                servicesFaits?.lignes
                  ?.map(
                    (i) =>
                      parseFloat(i.tauxHoraire?.montant || "0") * parseFloat(i.nbHeures || "0"),
                  )
                  .reduce((a, b) => a + b, 0) ?? 0,
              )}{" "}
              €
            </span>
          </div>
        )}
        columns={getServicesFaitsColumns().filter(
          (c) => afficherIntervenant || c.dataIndex !== "intervenant",
        )}
      />
    </>
  );
}
