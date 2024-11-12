/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { IDemande } from "../../api/ApiTypeHelpers";
import { useApi } from "../../context/api/ApiProvider";
import Spinner from "../Spinner/Spinner";
import { Badge, Button, List, Space } from "antd";
import TypeDemandeAvatar from "../Avatars/TypeDemandeAvatar";
import {
   ETAT_ATTENTE_CHARTES,
   ETAT_DEMANDE_EN_COURS,
   ETAT_DEMANDE_NON_CONFORME,
   ETAT_DEMANDE_REFUSEE,
   getTypeDemandeDescription,
} from "../../lib/demande";
import { useNavigate } from "react-router-dom";
import { EtatDemandeAvatar } from "../Avatars/EtatDemandeAvatar";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export default function DemandeListItem(props: { demande?: IDemande; demandeId?: string }) {
   const screens = useBreakpoint();
   const navigate = useNavigate();
   const [item, setItem] = useState(props.demande);
   const { data: demandeData } = useApi().useGetItem({
      path: "/demandes/{id}",
      url: props.demandeId as string,
      enabled: !!props.demandeId,
   });
   const { data: typeDemandeData } = useApi().useGetItem({
      path: "/types_demandes/{id}",
      url: item?.typeDemande as string,
      enabled: !!item?.typeDemande,
   });

   useEffect(() => {
      if (demandeData) {
         setItem(demandeData);
      }
   }, [demandeData]);

   if (!item || !typeDemandeData) return <Spinner />;

   function getActionButton() {
      switch (item?.etat) {
         case ETAT_DEMANDE_EN_COURS:
            return (
               <Button
                  onClick={() => navigate(`${item?.["@id"]}/saisie`)}
                  aria-label={`Continuer la saisie de la demande : ${typeDemandeData?.libelle}`}
               >
                  Continuer la saisie
               </Button>
            );
         case ETAT_DEMANDE_NON_CONFORME:
            return (
               <Button
                  onClick={() => navigate(`${item?.["@id"]}/saisie`)}
                  aria-label={`Reprendre la saisie de la demande : ${typeDemandeData?.libelle}`}
               >
                  Reprendre la saisie
               </Button>
            );
         case ETAT_ATTENTE_CHARTES:
            return (
               <Badge dot status="processing">
                  <Button
                     className="semi-bold"
                     onClick={() => navigate(item?.["@id"] as string)}
                     aria-label={`Valider la charte de la demande : ${typeDemandeData?.libelle}`}
                  >
                     Valider la charte
                  </Button>
               </Badge>
            );
         default:
            return (
               <Button
                  onClick={() => navigate(item?.["@id"] as string)}
                  aria-label={`Suivre l'avancement de la demande : ${typeDemandeData?.libelle}`}
               >
                  Suivre ma demande
               </Button>
            );
      }
   }

   return (
      <List.Item actions={screens.md ? [getActionButton()] : undefined}>
         <List.Item.Meta
            avatar={<TypeDemandeAvatar typeDemande={typeDemandeData} />}
            title={typeDemandeData.libelle}
            description={
               <>
                  <Space direction="vertical" size={3}>
                     <Space align="start" className="mb-1">
                        <EtatDemandeAvatar
                           etatDemandeId={item.etat}
                           afficherDerniereModification={
                              item.etat === ETAT_DEMANDE_NON_CONFORME ||
                              item.etat === ETAT_DEMANDE_REFUSEE
                           }
                           demandeId={item["@id"]}
                        />
                     </Space>
                     {getTypeDemandeDescription(typeDemandeData)}
                     {!screens.md && getActionButton()}
                  </Space>
               </>
            }
         />
      </List.Item>
   );
}
