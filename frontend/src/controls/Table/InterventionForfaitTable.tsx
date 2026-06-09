/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import interventionForfaitTableColumns from "@controls/Table/InterventionForfaitTableColumns";
import { Button, Flex, Space, Table } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { FilterFilled, FilterOutlined } from "@ant-design/icons";
import { useAuth } from "@/auth/AuthProvider";
import InterventionForfaitTableExport from "@controls/Table/InterventionForfaitTableExport";
import { SorterResult } from "antd/es/table/interface";
import { IInterventionForfait, Paths } from "@api";

export declare type FiltreInterventionsForfait = Exclude<
  Paths["/interventions_forfait"]["get"]["parameters"]["query"],
  undefined
>;

interface TableInterventionsForfaitProps {
  onEdit: (intervention: IInterventionForfait) => void;
}

export default function InterventionForfaitTable({ onEdit }: TableInterventionsForfaitProps) {
  const user = useAuth().user;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filtres, setFiltres] = useState<FiltreInterventionsForfait>({
    "order[intervenant.utilisateur.nom]": "asc",
  });

  const { data: interventions, isFetching: isFetchingInterventions } =
    useApi().useGetCollectionPaginated({
      path: "/interventions_forfait",
      page,
      itemsPerPage: pageSize,
      query: {
        ...filtres,
        "type[]": filtres["type[]"] || [],
      },
    });
  const { data: periodes, isFetching: isFetchingPeriodes } = useApi().useGetFullCollection({
    path: "/periodes",
  });

  return (
    <>
      <Flex justify="flex-end" align="center">
        <Space>
          <Button
            type={filtres.utilisateurCreation ? "primary" : "default"}
            className="float-right"
            icon={filtres.utilisateurCreation ? <FilterFilled /> : <FilterOutlined />}
            onClick={() => {
              if (filtres.utilisateurCreation) {
                setFiltres({
                  ...filtres,
                  utilisateurCreation: undefined,
                });
              } else {
                setFiltres({
                  ...filtres,
                  utilisateurCreation: user?.["@id"],
                });
              }
            }}
          >
            Interventions que vous avez créées
          </Button>
          <InterventionForfaitTableExport interventionsForfait={interventions?.items || []} />
        </Space>
      </Flex>
      <Table<IInterventionForfait>
        dataSource={interventions?.items}
        loading={isFetchingInterventions || isFetchingPeriodes}
        className="table-responsive"
        pagination={{
          pageSize: pageSize,
          total: interventions?.totalItems,
          current: page,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100, 200],
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showTotal: (total, range) => (
            <div className="text-legende mr-1">
              {range[0]} à {range[1]} / {total}
            </div>
          ),
        }}
        rowKey={(record) => record["@id"] as string}
        onChange={(_pagination, filters, sorter) => {
          const nvoFiltre: FiltreInterventionsForfait = {
            nomIntervenant: filters.intervenant?.[0]
              ? (filters.intervenant[0] as string)
              : undefined,
            "periode[]": filters.periode as string[] | undefined,
          };

          // tri
          function setOrder(sorterResult: SorterResult<IInterventionForfait>) {
            if (sorterResult.column?.dataIndex === "intervenant") {
              nvoFiltre["order[intervenant.utilisateur.nom]"] =
                sorterResult.order === "ascend" ? "asc" : "desc";
            } else if (sorterResult.column?.dataIndex === "periode") {
              nvoFiltre["order[intervenant.utilisateur.nom]"] = undefined;
            }
          }

          setOrder(Array.isArray(sorter) ? sorter[0] : sorter);

          setFiltres(nvoFiltre);
        }}
        columns={interventionForfaitTableColumns({
          filter: filtres,
          setFilter: setFiltres,
          periodes: periodes?.items,
          onEdit: (item) => onEdit(item),
        })}
        footer={() => {
          const nbHeure =
            interventions?.items.map((i) => parseFloat(i.heures)).reduce((a, b) => a + b, 0) ?? 0;
          return (
            <>
              Total des heures des interventions affichées :{" "}
              <span className="semi-bold">
                {Math.round(nbHeure)} heure{nbHeure > 1 ? "s" : ""}
              </span>
            </>
          );
        }}
      />
    </>
  );
}
