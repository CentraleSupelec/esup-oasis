/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ITypeDemande } from "../../../api/ApiTypeHelpers";
import { Empty, List } from "antd";
import TypeDemandeAvatar from "../../Avatars/TypeDemandeAvatar";
import { getTypeDemandeDescription } from "../../../lib/demande";
import React from "react";
import PostulerButton from "./BoutonPostuler";

export function TypesDemandesListItems(props: {
   titre: string;
   items: ITypeDemande[];
   titleClassName?: string;
   demandeurId: string;
   ajout: boolean;
}) {
   return (
      <>
         <h3 className={props.titleClassName}>{props.titre}</h3>
         <List bordered split>
            <ul className="pl-0">
               {props.items
                  .sort((t1, t2) => (t1.libelle || "").localeCompare(t2.libelle || ""))
                  .map((item) => (
                     <List.Item
                        key={item["@id"]}
                        actions={
                           props.ajout
                              ? [
                                   <PostulerButton
                                      typeDemande={item}
                                      demandeurId={props.demandeurId}
                                   />,
                                ]
                              : undefined
                        }
                     >
                        <List.Item.Meta
                           avatar={<TypeDemandeAvatar typeDemande={item} />}
                           title={item.libelle}
                           description={getTypeDemandeDescription(item)}
                        />
                     </List.Item>
                  ))}
               {props.items.length === 0 && (
                  <List.Item>
                     <Empty className="w-100" description="Aucune campagne disponible." />
                  </List.Item>
               )}
            </ul>
         </List>
      </>
   );
}
