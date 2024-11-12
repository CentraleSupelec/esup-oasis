/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ascendToAsc, ascToAscend } from "../../../utils/array";
import { App, Button, Descriptions, Empty, Flex, FormInstance, Space, Table } from "antd";
import React, { useEffect } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import { useApi } from "../../../context/api/ApiProvider";
import { ISuiviAcitivite } from "../../../api/ApiTypeHelpers";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getLibellePeriode } from "../../../utils/dates";
import { Fichier } from "../../Fichier/Fichier";
import Spinner from "../../Spinner/Spinner";
import { operations } from "../../../api/schema";
import ProfilItem from "../../Items/ProfilItem";
import GestionnaireItem from "../../Items/GestionnaireItem";
import ComposanteItem from "../../Items/ComposanteItem";
import FormationItem from "../../Items/FormationItem";
import { FiltreBilanActivitesForm } from "../../../routes/administration/Bilans/BilanActivites/BilanActivites";

import { UseStateDispatch } from "../../../utils/utils";

type BilanQuery = operations["api_suivisactivite_get_collection"]["parameters"]["query"];

function FiltresBilan(props: { bilan: ISuiviAcitivite }): React.ReactElement {
   const [expanded, setExpanded] = React.useState<boolean>(false);
   const filters = [];

   if (props.bilan.profils?.length) {
      filters.push(
         <Descriptions.Item key="profils" label="Profils">
            <ProfilItem profils={props.bilan.profils} />
         </Descriptions.Item>,
      );
   }

   if (props.bilan.gestionnaires?.length) {
      filters.push(
         <Descriptions.Item key="gestionnaires" label="Chargé•e d'acc.">
            <Space>
               {props.bilan.gestionnaires.map((gestionnaire) => (
                  <GestionnaireItem key={gestionnaire} gestionnaireId={gestionnaire} />
               ))}
            </Space>
         </Descriptions.Item>,
      );
   }

   if (props.bilan.composantes?.length) {
      filters.push(
         <Descriptions.Item key="composantes" label="Composantes">
            {props.bilan.composantes.map((composante) => (
               <ComposanteItem key={composante} composanteId={composante} />
            ))}
         </Descriptions.Item>,
      );
   }

   if (props.bilan.formations?.length) {
      filters.push(
         <Descriptions.Item key="formations" label="Formations">
            {props.bilan.formations.map((formation) => (
               <FormationItem key={formation} formationId={formation} />
            ))}
         </Descriptions.Item>,
      );
   }

   if (!filters.length) return <span className="text-legende italic">Aucun filtre</span>;
   if (!expanded)
      if (filters.length === 1) {
         return (
            <Button type="dashed" icon={<FilterOutlined />} onClick={() => setExpanded(true)}>
               Voir le filtre
            </Button>
         );
      } else {
         return (
            <Button type="dashed" icon={<FilterOutlined />} onClick={() => setExpanded(true)}>
               Voir les {filters.length} filtres
            </Button>
         );
      }

   return (
      <Descriptions size="small" bordered column={1}>
         {filters}
      </Descriptions>
   );
}

export function TableBilanActivite(props: {
   setAjouterBilan: UseStateDispatch<boolean>;
   form: FormInstance<FiltreBilanActivitesForm>;
}) {
   const { message } = App.useApp();
   const [enCoursGeneration, setEnCoursGeneration] = React.useState<boolean>(false);
   const user = useAuth().user;

   const [filters, setFilters] = React.useState<BilanQuery>({
      page: 1,
      itemsPerPage: 5,
      "order[dateDemande]": "desc",
      demandeur: user?.["@id"],
   });
   const { data: bilans, refetch } = useApi().useGetCollection({
      path: "/suivis/activite",
      query: filters,
   });
   const mutationDelete = useApi().useDelete({
      path: "/suivis/activite",
      invalidationQueryKeys: ["/suivis/activite"],
      onSuccess: () => {
         message.success("Le bilan a bien été supprimé");
      },
   });

   useEffect(() => {
      let timer = null;
      if (enCoursGeneration) {
         timer = setTimeout(() => {
            setEnCoursGeneration(false);
            refetch().then();
         }, 2000);
      }

      return () => {
         if (timer) clearTimeout(timer);
      };
   }, [enCoursGeneration, refetch]);

   return (
      <Table<ISuiviAcitivite>
         dataSource={bilans?.items || []}
         locale={{
            emptyText: <Empty description="Aucun bilan demandé" />,
         }}
         className="table-responsive mt-2"
         pagination={{
            pageSize: filters?.itemsPerPage || 5,
            total: bilans?.totalItems,
            current: filters?.page || 1,
            showTotal: (total, range) => (
               <div className="text-legende mr-1">
                  {range[0]} à {range[1]} / {total}
               </div>
            ),
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
         }}
         onChange={(pagination, f, sorter) => {
            if (Array.isArray(sorter)) {
               return;
            }

            setFilters({
               ...filters,
               page: pagination.current || 1,
               itemsPerPage: pagination.pageSize || 5,
               "order[dateDemande]": ascendToAsc(sorter.order),
            });
         }}
         caption={
            <Flex justify="space-between" align="center" className="w-100">
               <span className="legende">{bilans?.totalItems} bilans</span>
               <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() =>
                     props.setAjouterBilan(() => {
                        props.form.resetFields();
                        return true;
                     })
                  }
               >
                  Demander un nouveau bilan
               </Button>
            </Flex>
         }
         rowKey={(record) => record["@id"] as string}
         columns={[
            {
               title: "Date demande",
               dataIndex: "dateDemande",
               key: "dateDemande",
               sortDirections: ["ascend", "descend"],
               sorter: true,
               defaultSortOrder: "descend",
               sortOrder: ascToAscend(filters?.["order[dateDemande]"]),
               width: 175,
               render: (dateDemande) => dayjs(dateDemande).format("DD/MM/YYYY HH:mm"),
            },
            {
               title: "Période",
               dataIndex: "date",
               key: "dates",
               width: 275,
               render: (_date, record) => getLibellePeriode(record.debut, record.fin, "MMM"),
            },
            {
               title: "Filtres",
               key: "filtres",
               render: (record) => <FiltresBilan bilan={record} />,
            },
            {
               key: "actions",
               width: 100,
               render: (record: ISuiviAcitivite) => {
                  if (!record.fichier) setEnCoursGeneration(true);

                  return record.fichier ? (
                     <Fichier
                        fichierId={record.fichier}
                        onRemove={() => {
                           mutationDelete.mutate({ "@id": record["@id"] as string });
                        }}
                        hideLibelle
                     />
                  ) : (
                     <Space>
                        <Spinner className="text-legende" />
                        <span className="legende">En cours de génération...</span>
                     </Space>
                  );
               },
            },
         ]}
      />
   );
}
