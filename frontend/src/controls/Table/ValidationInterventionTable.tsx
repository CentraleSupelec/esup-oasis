/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { App, Flex, FloatButton, Space, Switch, Table } from "antd";
import Spinner from "@controls/Spinner/Spinner";
import { CheckOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { queryClient } from "@/queryClient";
import validationInterventionTableColumns from "@controls/Table/ValidationInterventionTableColumns";
import { IEvenement, QK_EVENEMENTS, QK_STATISTIQUES_EVENEMENTS } from "@api";
import { createDateAsUTC } from "@utils/dates";

export interface FiltreValidationInterventions {
  nomIntervenant?: string;
  "type[]"?: string[];
  "exists[dateAnnulation]"?: boolean;
}

export default function ValidationInterventionTable() {
  const { notification } = App.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRowsKeys, setSelectedRowsKeys] = useState<string[]>([]);
  const [typeTraitement, setTypeTraitement] = useState<"validation" | "annulation">();
  const [isValidating, setIsValidating] = useState(false);
  const [filtreValidationInterventions, setFiltreValidationInterventions] =
    useState<FiltreValidationInterventions>({
      "exists[dateAnnulation]": false,
    });
  const { data: evenements, isFetching: isFetchingEvenements } = useApi().useGetCollectionPaginated(
    {
      path: "/evenements",
      page,
      itemsPerPage: pageSize,
      query: {
        "exists[intervenant]": true,
        aValider: true,
        ...filtreValidationInterventions,
        "type[]": filtreValidationInterventions["type[]"] || [],
      },
    },
  );
  const { data: typesEvenements, isFetching: isFetchingTypesEvenements } =
    useApi().useGetFullCollection({
      path: "/types_evenements",
      query: {
        forfait: false,
      },
    });

  const mutateEvenement = useApi().usePatch({
    path: "/evenements/{id}",
    invalidationQueryKeys: [QK_EVENEMENTS],
    onSuccess: () => {
      setSelectedRowsKeys(selectedRowsKeys.slice(1));
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      window.setTimeout(() => validerPremiereIntervention(), 500);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: [QK_STATISTIQUES_EVENEMENTS] }).then();
      setIsValidating(false);
    },
  });

  function validerPremiereIntervention() {
    setIsValidating(true);
    if (selectedRowsKeys.length === 0) {
      // Fin du traitement
      notification.success({
        title:
          typeTraitement === "validation"
            ? "Validation des interventions"
            : "Annulation des interventions",
        description: `Toutes les interventions sélectionnées ont été ${
          typeTraitement === "validation" ? "validées" : "annulées"
        }.`,
      });
      queryClient
        .invalidateQueries({ queryKey: [QK_STATISTIQUES_EVENEMENTS] })
        .then(() => setTypeTraitement(undefined));
      setIsValidating(false);
      return;
    }

    // Lancement du traitement sur la première intervention sélectionnée
    const evenementId = selectedRowsKeys[0];
    const data =
      typeTraitement === "validation"
        ? { valide: true, dateAnnulation: null }
        : { valide: false, dateAnnulation: createDateAsUTC(new Date()).toISOString() };
    mutateEvenement.mutate({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      "@id": evenementId,
    });
  }

  useEffect(() => {
    if (typeTraitement) {
      validerPremiereIntervention();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeTraitement]);

  return (
    <>
      <Flex justify="flex-end" align="center">
        <Space>
          <span>Masquer les annulations</span>
          <Switch
            size="small"
            checked={filtreValidationInterventions["exists[dateAnnulation]"] === false}
            onChange={(checked) => {
              setFiltreValidationInterventions({
                ...filtreValidationInterventions,
                "exists[dateAnnulation]": checked ? false : undefined,
              });
            }}
          />
        </Space>
      </Flex>
      <Table<IEvenement>
        dataSource={evenements?.items}
        loading={isFetchingEvenements || isFetchingTypesEvenements}
        className="table-responsive"
        pagination={{
          pageSize: pageSize,
          total: evenements?.totalItems,
          current: page,
          showSizeChanger: true,
          pageSizeOptions: [2, 25, 50, 100, 200],
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
        rowSelection={{
          type: "checkbox",
          onChange: (selectedRowKeys) => {
            setSelectedRowsKeys(selectedRowKeys as string[]);
          },
          selectedRowKeys: selectedRowsKeys,
        }}
        onRow={(record) => {
          return {
            className: `pointer${record.dateAnnulation ? " table-row-deleted" : ""}`,
            onClick: () => {
              if (selectedRowsKeys.includes(record["@id"] as string)) {
                setSelectedRowsKeys(selectedRowsKeys.filter((id) => id !== record["@id"]));
              } else {
                setSelectedRowsKeys([...selectedRowsKeys, record["@id"] as string]);
              }
            },
          };
        }}
        columns={validationInterventionTableColumns({
          filter: filtreValidationInterventions,
          setFilter: setFiltreValidationInterventions,
          typesEvenements: typesEvenements?.items,
        })}
        onChange={(_pagination, filters) => {
          setFiltreValidationInterventions({
            ...filtreValidationInterventions,
            "type[]": filters.type as string[],
          });
        }}
      />

      {selectedRowsKeys.length > 0 && (
        <FloatButton.Group
          trigger="click"
          type="primary"
          icon={isValidating ? <Spinner /> : <MenuOutlined />}
        >
          <FloatButton
            tooltip="Annuler les interventions sélectionnées"
            icon={<DeleteOutlined className="text-error" />}
            onClick={() => {
              if (!isValidating) setTypeTraitement("annulation");
            }}
          />
          <FloatButton
            tooltip="Valider les interventions sélectionnées"
            icon={<CheckOutlined className="text-success" />}
            onClick={() => {
              if (!isValidating) setTypeTraitement("validation");
            }}
          />
        </FloatButton.Group>
      )}
    </>
  );
}
