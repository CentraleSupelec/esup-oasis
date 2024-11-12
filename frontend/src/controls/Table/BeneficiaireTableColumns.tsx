/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ColumnType } from "antd/es/table";
import { IBeneficiaire, IDecisionEtablissement, IUtilisateur } from "../../api/ApiTypeHelpers";
import ComposanteItem from "../Items/ComposanteItem";
import React from "react";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import Icon, { EyeOutlined, MinusOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { ascToAscend } from "../../utils/array";
import { FilterProps } from "../../utils/table";
import { FiltreBeneficiaire } from "./BeneficiaireTable";
import { RoleValues, Utilisateur } from "../../lib/Utilisateur";
import { ReactComponent as ExternalLink } from "../../assets/images/external-link.svg";

import { ChargesAccompagnementsItem } from "../Items/ChargesAccompagnementsItem";
import { UtilisateurTag } from "../Tags/UtilisateurTag";
import { BeneficiaireAvisEseAvatar, EtatAvisEse } from "../Avatars/BeneficiaireAvisEseAvatar";
import UtilisateurAvatarImage from "../Avatars/UtilisateurAvatarImage";
import { EllipsisMiddle } from "../Typography/EllipsisMiddle";
import Highlighter from "react-highlight-words";
import { removeAccents } from "../../utils/string";
import { DecisionEtablissementAvatar } from "../Avatars/DecisionEtablissementAvatar";
import { BeneficiaireProfilItem } from "../Items/BeneficiaireProfilItem";

import { UseStateDispatch } from "../../utils/utils";
import { env } from "../../env";
import dayjs from "dayjs";

interface TableBeneficiairesColumnsProps {
   user: Utilisateur | undefined;
   filter: FiltreBeneficiaire;
   setFilter: UseStateDispatch<FiltreBeneficiaire>;
   onBeneficiaireSelected: (beneficiaire: IBeneficiaire) => void;
   onImpersonate: (uid: string) => void;
}

export function beneficiaireTableColumns({
   user,
   filter,
   setFilter,
   onBeneficiaireSelected,
   onImpersonate,
}: TableBeneficiairesColumnsProps): ColumnType<IBeneficiaire>[] {
   function canImpersonate() {
      return user?.isAdmin && env.REACT_APP_ENVIRONMENT !== "production";
   }

   // noinspection JSUnusedGlobalSymbols
   const clickableCell = {
      className: "pointer",
      onCell: (record: IBeneficiaire) => {
         return {
            onClick: () => {
               onBeneficiaireSelected(record);
            },
         };
      },
   };

   return [
      {
         title: "Bénéficiaire",
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
                     role={RoleValues.ROLE_BENEFICIAIRE}
                     className="border-0"
                     responsive="lg"
                  />
                  <span>
                     <span className="semi-bold">
                        <Highlighter
                           textToHighlight={(record?.nom || "").toLocaleUpperCase()}
                           searchWords={[removeAccents(filter.nom || "")]}
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
         ...FilterProps<FiltreBeneficiaire>("nom", filter, setFilter),
         filteredValue: filter?.nom ? [filter?.nom] : null,
         ...clickableCell,
      } as ColumnType<IBeneficiaire>,

      {
         title: "Inscription",
         dataIndex: "inscription",
         render: (_value: string, record: IBeneficiaire) => {
            return record.inscriptions ? (
               record.inscriptions
                  .filter((inscription) => dayjs(inscription.fin).isAfter())
                  .map((inscription) => (
                     <Space
                        key={inscription["@id"]}
                        className="mt-05 mb-05"
                        direction="vertical"
                        size={2}
                     >
                        <ComposanteItem composanteId={inscription?.formation?.composante} />
                        <EllipsisMiddle
                           className="light"
                           style={{ maxWidth: 350 }}
                           suffixCount={12}
                           content={inscription?.formation?.libelle as string}
                           expandable
                        />
                     </Space>
                  ))
            ) : (
               <MinusOutlined />
            );
         },
      },

      {
         title: "Tags",
         dataIndex: "tags",
         key: "tags",
         responsive: ["lg"],
         render: (_value: string[], record: IBeneficiaire) => {
            return (
               <div>
                  {record.tags?.map((tag) => (
                     <UtilisateurTag
                        tagId={tag}
                        key={tag}
                        utilisateurId={record.uid as string}
                        className="mb-1"
                     />
                  ))}
               </div>
            );
         },
      },
      user?.isGestionnaire
         ? {
              title: "Profils actifs",
              dataIndex: "profils",
              key: "profils",
              responsive: ["lg"],
              render: (values: string[]) => {
                 return values.map((profilBeneficiaire) => (
                    <BeneficiaireProfilItem
                       key={profilBeneficiaire}
                       profilBeneficiaire={profilBeneficiaire}
                       masquerSiInactif
                    />
                 ));
              },
           }
         : null,
      user?.isGestionnaire
         ? {
              title: `Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`,
              dataIndex: "etatAvisEse",
              key: "etatAvisEse",
              className: "text-center",
              responsive: ["lg"],
              render: (value: string) => {
                 return (
                    <BeneficiaireAvisEseAvatar
                       etatAvisEse={value as EtatAvisEse}
                       showLabel={false}
                       direction="vertical"
                       className="fs-12"
                    />
                 );
              },
           }
         : null,
      {
         title: "Décision étab.",
         dataIndex: "IDecisionEtablissement",
         key: "IDecisionEtablissement",
         className: "text-center",
         responsive: ["lg"],
         render: (_value: IDecisionEtablissement, record: IBeneficiaire) => {
            return record.decisionAmenagementAnneeEnCours ? (
               <DecisionEtablissementAvatar
                  decisionEtab={record.decisionAmenagementAnneeEnCours}
                  showLabel={false}
                  direction="vertical"
                  className="fs-12"
               />
            ) : null;
         },
      },
      {
         title: <span aria-label="Chargés d'accompagnement">Chargé•es d'acc.</span>,
         dataIndex: "gestionnaire[]",
         key: "gestionnaire[]",
         responsive: ["lg"],
         render: (_value: string[], record: IBeneficiaire) => {
            return <ChargesAccompagnementsItem utilisateur={record} />;
         },
      },
      {
         key: "actions",
         filteredValue: null,
         className: "text-right",
         width: 160,
         render: (_value: unknown, record: IBeneficiaire) => (
            <Space>
               {canImpersonate() && (
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
                        <Button
                           icon={<UserSwitchOutlined />}
                           onClick={(ev) => ev.stopPropagation()}
                        />
                     </Tooltip>
                  </Popconfirm>
               )}
               <Button.Group>
                  <Button
                     icon={<EyeOutlined />}
                     onClick={() => {
                        onBeneficiaireSelected(record);
                     }}
                  >
                     Voir
                  </Button>
                  {user?.isGestionnaire && (
                     <Tooltip title="Ouvrir dans un nouvel onglet">
                        <Button
                           className="text-light"
                           icon={<Icon component={ExternalLink} className="fs-08" />}
                           onClick={() => {
                              window.open(
                                 record["@id"]?.replace("/utilisateurs/", "/beneficiaires/"),
                                 "_blank",
                              );
                           }}
                        />
                     </Tooltip>
                  )}
               </Button.Group>
            </Space>
         ),
      },
   ].filter((c) => c !== null) as ColumnType<IBeneficiaire>[];
}
