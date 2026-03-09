/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Empty, List, Space, Tooltip } from "antd";
import React, { ReactElement } from "react";
import { IDemande, IUtilisateur } from "../../api/ApiTypeHelpers";
import { NB_MAX_ITEMS_PER_PAGE } from "../../constants";
import { useApi } from "../../context/api/ApiProvider";
import TypeDemandeItem from "../Items/TypeDemandeItem";
import { EtatDemandeAvatar } from "../Avatars/EtatDemandeAvatar";
import dayjs from "dayjs";
import Icon, { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ExternalLink } from "../../assets/images/external-link.svg";

interface ITabDemandesProps {
   utilisateur: IUtilisateur;
   title: React.ReactElement;
}

interface ITabDemandesItemProps {
   demande: IDemande;
}

/**
 * Renders a single item in the TabDemandes component.
 *
 * @param {ITabDemandesItemProps} props - The props object.
 * @param {IDemande} props.demande - The inscription object containing information about the item.
 *
 * @return {ReactElement} - The rendered item component.
 */
function TabDemandesItem({ demande }: ITabDemandesItemProps): ReactElement {
   const navigate = useNavigate();
   return (
      <List.Item
         onClick={() => navigate(demande["@id"] as string)}
         className="pointer"
         extra={
            <Button.Group>
               <Button icon={<EyeOutlined />} onClick={() => navigate(demande["@id"] as string)}>
                  Voir
               </Button>
               <Tooltip title="Ouvrir dans un nouvel onglet">
                  <Button
                     className="text-light"
                     icon={<Icon component={ExternalLink} className="fs-08" />}
                     onClick={(e) => {
                        e.stopPropagation();
                        window.open(demande["@id"], "_blank");
                     }}
                  />
               </Tooltip>
            </Button.Group>
         }
      >
         <List.Item.Meta
            title={
               <TypeDemandeItem typeDemandeId={demande.typeDemande} showAvatar={false} showInfos />
            }
            description={
               <Space orientation="vertical">
                  <Space>
                     <span>Date de dépôt</span>
                     <span className="semi-bold">
                        {dayjs(demande.dateDepot).format("DD/MM/YYYY")}
                     </span>
                  </Space>
               </Space>
            }
            avatar={<EtatDemandeAvatar etatDemandeId={demande.etat} />}
         />
      </List.Item>
   );
}

/**
 * Renders the "TabDemandes" component.
 * This component displays the user's registrations.
 *
 * @param {ITabDemandesProps} props - The component props.
 * @param {IUtilisateur} props.utilisateur - The user object containing the registrations.
 *
 * @returns {ReactElement} The rendered component.
 */
export function TabDemandes({ utilisateur, title }: ITabDemandesProps): ReactElement {
   const { data: demandes, isFetching: fetchingDemandes } = useApi().useGetCollectionPaginated({
      path: "/demandes",
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      query: {
         demandeur: utilisateur["@id"],
         "order[dateDepot]": "desc",
         format_simple: true,
      },
   });

   return (
      <>
         {title}
         {!demandes || demandes?.items?.length === 0 ? (
            <Empty description="Aucune demande" />
         ) : (
            <List loading={fetchingDemandes} className="ant-list-radius ant-list-animated">
               {demandes?.items?.map((demande) => (
                  <TabDemandesItem key={demande?.["@id"]} demande={demande} />
               ))}
            </List>
         )}
      </>
   );
}
