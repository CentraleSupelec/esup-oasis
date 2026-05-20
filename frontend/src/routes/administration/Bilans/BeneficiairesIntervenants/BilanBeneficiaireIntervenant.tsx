/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
   Breadcrumb,
   Button,
   Card,
   Empty,
   Form,
   Layout,
   Select,
   Space,
   Table,
   Typography,
} from "antd";
import { NavLink } from "react-router-dom";
import { DownloadOutlined, FilterOutlined, HomeFilled } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { capitalize } from "../../../../utils/string";
import { useApi } from "../../../../context/api/ApiProvider";
import { PREFETCH_CAMPUS, PREFETCH_TYPES_EVENEMENTS } from "../../../../api/ApiPrefetchHelpers";
import { CSVLink } from "react-csv";
import { NB_MAX_ITEMS_PER_PAGE, PARAMETRE_COEF_COUT_CHARGE } from "../../../../constants";
import {
   IActiviteBeneficiaire,
   IActiviteIntervenant,
   IPeriode,
} from "../../../../api/ApiTypeHelpers";
import TypeEvenementItem from "../../../../controls/Items/TypeEvenementItem";
import CampusItem from "../../../../controls/Items/CampusItem";
import UtilisateurFormItemSelect from "../../../../controls/Forms/UtilisateurFormItemSelect";
import { RoleValues } from "../../../../lib/Utilisateur";
import { ApiPathMethodQuery } from "../../../../api/SchemaHelpers";
import PeriodeField from "../../../../controls/Forms/PeriodeField";
import { ColumnsType } from "antd/lib/table";
import { montantToString, to2Digits } from "../../../../utils/number";
import EtudiantItem from "../../../../controls/Items/EtudiantItem";
import { env } from "../../../../env";
import { CoutCharge } from "../../../../controls/Admin/Bilans/CoutCharge";

type FiltreBilanIntervenant = ApiPathMethodQuery<"/suivis/intervenants", "get">;
type FiltreBilanBeneficiaire = ApiPathMethodQuery<"/suivis/beneficiaires", "get">;
type FiltreBilan = FiltreBilanBeneficiaire | FiltreBilanIntervenant;
export type IActivite = IActiviteBeneficiaire | IActiviteIntervenant;

/**
 * Retrieves the columns for a Suivi table based on the given type.
 * @param {string} type - The type of table columns to retrieve. Valid values are "bénéficiaire" or "intervenant".
 * @return {Array<object>} - An array of column objects.
 */
function getTableColumns(type: "bénéficiaire" | "intervenant"): ColumnsType<IActivite> {
   return [
      {
         title: capitalize(type),
         dataIndex: "utilisateur",
         render: (_value, record: IActivite) => (
            <EtudiantItem
               utilisateur={record.utilisateur}
               showEmail
               role={
                  type === "intervenant"
                     ? RoleValues.ROLE_BENEFICIAIRE
                     : RoleValues.ROLE_BENEFICIAIRE
               }
            />
         ),
      },
      {
         title: "Campus",
         dataIndex: "campus",
         render: (value: string) => value && <CampusItem campusId={value} />,
      },
      {
         title: "Catégorie d'événement",
         dataIndex: "type",
         render: (value: string) => <TypeEvenementItem typeEvenementId={value} forceBlackText />,
      },
      {
         title: "Nombre d'évènements",
         dataIndex: "nbEvenements",
         className: "text-right",
         render: (value: string) => {
            return <>{value}</>;
         },
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
         title: "Taux horaire",
         dataIndex: "tauxHoraire",
         className: "text-right",
         render: (_value, record: IActivite) => (
            <Space>
               {to2Digits(record.tauxHoraire?.montant)}
               <span>€</span>
            </Space>
         ),
      },
      {
         title: "Montant",
         dataIndex: "montant",
         className: "text-right",
         render: (_value: string, record: IActivite) => (
            <Space>
               {montantToString(record.nbHeures, record.tauxHoraire?.montant)}
               <span>€</span>
            </Space>
         ),
      },
      {
         title: "Coût chargé",
         dataIndex: "coutCharge",
         className: "text-right",
         render: (_value: string, record: IActivite) => (
            <Space>
               <CoutCharge activite={record} />
            </Space>
         ),
      },
   ];
}

/**
 * Compute the activity report for beneficiaries or intervenants.
 *
 * @param {object} props - The props object.
 * @param {string} props.type - The type of activity report: "bénéficiaire" or "intervenant".
 *
 * @return {React.ReactElement} - The activity report component.
 */
export default function BilanBeneficiaireIntervenant(props: {
   type: "bénéficiaire" | "intervenant";
}): React.ReactElement {
   const [form] = Form.useForm();
   const [submitted, setSubmitted] = useState(false);
   const [filtre, setFiltre] = useState<FiltreBilan>();
   const [data, setData] = useState<IActivite[]>();
   const { data: campus, isFetching: isFetchingCampus } =
      useApi().useGetCollection(PREFETCH_CAMPUS);
   const { data: typesEvenements, isFetching: isFetchingTypesEvenements } =
      useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);
   const { data: coef } = useApi().useGetItem({
      path: "/parametres/{cle}",
      url: PARAMETRE_COEF_COUT_CHARGE,
   });

   const { data: dataRaw, isFetching } = useApi().useGetCollectionPaginated({
      path: `/suivis/${props.type === "bénéficiaire" ? "beneficiaire" : "intervenant"}s`,
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      query: filtre,
      enabled: !!filtre,
   });

   useEffect(() => {
      if (dataRaw && coef?.valeursCourantes && coef?.valeursCourantes.length === 1) {
         setData(
            dataRaw.items.map((item) => ({
               nom: item.utilisateur?.nom?.toLocaleUpperCase(),
               prenom: item.utilisateur?.prenom,
               email: item.utilisateur?.email,
               campus: campus?.items.find((c) => c["@id"] === item.campus)?.libelle,
               "categorie evenement": typesEvenements?.items.find((c) => c["@id"] === item.type)
                  ?.libelle,
               nbEvenements: item.nbEvenements,
               nbHeures: to2Digits(item.nbHeures),
               "taux horaire": to2Digits(item.tauxHoraire?.montant),
               montant: montantToString(item.nbHeures, item.tauxHoraire?.montant),
               "cout charge": montantToString(
                  item.nbHeures,
                  item.tauxHoraire?.montant,
                  coef.valeursCourantes?.[0].valeur ?? undefined,
               ),
            })),
         );
      }
   }, [campus?.items, coef?.valeursCourantes, dataRaw, typesEvenements?.items]);

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   function buildFiltre(values: any) {
      const filtres: FiltreBilan = {
         "campus[]": values["campus[]"],
         "type[]": values["type[]"],
      };

      if (values["periode[]"] && values["periode[]"].length > 0) {
         filtres["periode[]"] = values["periode[]"].map((p: IPeriode) => p["@id"] as string);
      }

      if (values.utilisateur) {
         if (props.type === "bénéficiaire") {
            ((filtres as FiltreBilanBeneficiaire) || {}).beneficiaires = values.utilisateur;
         } else {
            ((filtres as FiltreBilanIntervenant) || {}).intervenant = values.utilisateur;
         }
      }

      setSubmitted(true);
      setFiltre(filtres);
   }

   /**
    * Generates a download link for a CSV file.
    *
    * @returns {React.ReactElement|null} The download link for the CSV file, or null if there is no data.
    */
   function getDownloadLink(): React.ReactElement | null {
      if (!data || !dataRaw) {
         return null;
      }

      if (dataRaw.totalItems === 0) {
         return null;
      }

      return (
         <>
            <CSVLink
               data={data}
               filename={`${env.REACT_APP_TITRE}-bilan-${props.type}s.csv`}
               separator=";"
            >
               <Button
                  type={data ? "primary" : undefined}
                  icon={<DownloadOutlined />}
                  loading={!data}
                  disabled={!data}
               >
                  Télécharger le bilan
               </Button>
            </CSVLink>
            <div className="legende">
               ({dataRaw.totalItems} enregistrement
               {dataRaw.totalItems > 1 ? "s" : ""})
            </div>
         </>
      );
   }

   return (
      <Layout.Content className="administration" style={{ padding: "0 50px" }}>
         <Typography.Title level={1}>Bilans</Typography.Title>
         <Breadcrumb
            className="mt-2"
            items={[
               {
                  key: "bilans",
                  title: (
                     <NavLink to="/bilans">
                        <Space>
                           <HomeFilled />
                           Bilans
                        </Space>
                     </NavLink>
                  ),
               },
               {
                  key: "utilisateur",
                  title: `${capitalize(props.type)}s`,
               },
            ]}
         />
         <Typography.Title level={2}>
            Suivi de l'activité des {`${capitalize(props.type)}s`}
         </Typography.Title>
         <Form
            form={form}
            layout="vertical"
            onFinish={(values) => buildFiltre(values)}
            onValuesChange={() => {
               setSubmitted(false);
            }}
         >
            <Card
               title={
                  <Space>
                     <FilterOutlined />
                     Définition des filtres du bilan
                  </Space>
               }
               actions={[
                  !submitted && (
                     <Button
                        size="large"
                        type={!data ? "primary" : undefined}
                        htmlType="submit"
                        loading={isFetching}
                     >
                        Demander le bilan
                     </Button>
                  ),
                  submitted && dataRaw && data && getDownloadLink(),
                  submitted && dataRaw && data && (
                     <Button
                        size="large"
                        onClick={() => {
                           form.resetFields();
                           //   setData(undefined);
                           //   setFiltre(undefined);
                           setSubmitted(false);
                        }}
                     >
                        Réinitialiser
                     </Button>
                  ),
               ].filter((a) => a)}
            >
               <Form.Item name="utilisateur" label={capitalize(props.type)}>
                  <UtilisateurFormItemSelect
                     placeholder={`Tous les ${props.type}s`}
                     roleUtilisateur={
                        props.type === "bénéficiaire"
                           ? RoleValues.ROLE_BENEFICIAIRE
                           : RoleValues.ROLE_INTERVENANT
                     }
                  />
               </Form.Item>
               <Form.Item name="periode[]" label="Périodes">
                  <PeriodeField mode="tags" placeholder="Toutes les périodes" />
               </Form.Item>
               <Form.Item name="campus[]" label="Campus">
                  <Select
                     mode="tags"
                     loading={isFetchingCampus}
                     placeholder="Tous les campus"
                     options={campus?.items.map((c) => ({
                        label: c.libelle,
                        value: c["@id"] as string,
                     }))}
                  />
               </Form.Item>
               <Form.Item name="type[]" label="Catégorie d'évènement">
                  <Select
                     mode="tags"
                     loading={isFetchingTypesEvenements}
                     placeholder="Toutes les catégories"
                     options={typesEvenements?.items.map((c) => ({
                        label: c.libelle,
                        value: c["@id"] as string,
                        className: `text-${c.couleur}-dark`,
                     }))}
                  />
               </Form.Item>
            </Card>
         </Form>
         {submitted && dataRaw && dataRaw.totalItems === 0 && <Empty className="mt-2" />}

         {submitted && data && dataRaw && dataRaw.totalItems > 0 && (
            <Card className="mt-3" loading={isFetching} title={`${capitalize(props.type)}s`}>
               <Table<IActivite>
                  dataSource={dataRaw?.items}
                  columns={getTableColumns(props.type)}
                  pagination={false}
                  rowKey={(record) => record["@id"] as string}
               />
            </Card>
         )}
      </Layout.Content>
   );
}
