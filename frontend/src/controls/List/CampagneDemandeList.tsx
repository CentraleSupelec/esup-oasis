/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Empty, List, Skeleton } from "antd";
import DemandeListItem from "../Items/DemandeListItem";
import { IDemande } from "../../api/ApiTypeHelpers";

/**
 * Liste des types de demandes
 * @param props
 * @param {boolean} props.isFetching - Indique si la liste est en cours de chargement
 * @param {IDemande[]} props.demandes - Liste des demandes
 * @constructor
 */
function TypeDemandeList(props: { isFetching?: boolean; demandes?: IDemande[] }) {
   if (props.isFetching) {
      // Affiche un squelette de chargement si les données sont en cours de récupération
      return <Skeleton paragraph={{ rows: 3 }} active />;
   }

   if (!props.demandes) return null;

   if (props.demandes.length === 0)
      return (
         <Empty
            description={
               <>
                  <div className="semi-bold">Vous n'avez aucune demande en cours.</div>
                  <p>
                     Pour créer une nouvelle demande, cliquez sur le bouton "Déposer une nouvelle
                     demande" ci-dessus.
                  </p>
               </>
            }
         />
      );

   return (
      <List>
         <ul className="pl-0">
            {props.demandes.map((item) => (
               <DemandeListItem key={item["@id"]} demande={item} />
            ))}
         </ul>
      </List>
   );
}

export default TypeDemandeList;
