/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Evenement } from "../../../../lib/Evenement";
import { useAuth } from "../../../../auth/AuthProvider";
import { Descriptions, List, Space, Typography } from "antd";
import GestionnaireItem from "../../../Items/GestionnaireItem";
import TypeEquipementItem from "../../../Items/TypeEquipementItem";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import TarifEvenementField from "../../../Forms/TarifEvenementField";

/**
 * Renders additional information about an event.
 *
 * @param props - The component props.
 * @param props.evenement - The event object.
 * @returns The rendered component.
 */
export function EvenementResumeAutresInformations(props: { evenement: Evenement | undefined }) {
   const user = useAuth().user;

   return useMemo(
      () => (
         <Descriptions title="Autres informations" bordered column={1} className="mt-3">
            <Descriptions.Item label="Gestionnaire en charge de l'organisation">
               <List size="small">
                  <ul className="list-nostyle">
                     {[
                        props.evenement?.utilisateurCreation,
                        props.evenement?.utilisateurModification,
                     ]
                        // Non null
                        .filter((gestionnaire) => gestionnaire)
                        // Valeurs uniques
                        .filter((gestionnaire, index, self) => self.indexOf(gestionnaire) === index)
                        .map((gestionnaire) => (
                           <List.Item key={gestionnaire}>
                              <GestionnaireItem gestionnaireId={gestionnaire} showEmail />
                           </List.Item>
                        ))}
                  </ul>
               </List>
            </Descriptions.Item>
            <Descriptions.Item label="Aménagements">
               <List size="small">
                  <ul className="list-nostyle">
                     {props.evenement?.equipements?.map((equipement) => (
                        <List.Item key={equipement}>
                           <TypeEquipementItem typeEquipementId={equipement} />
                        </List.Item>
                     ))}
                     {props.evenement?.equipements?.length === 0 && (
                        <List.Item>Aucun équipement nécessaire</List.Item>
                     )}
                  </ul>
               </List>
            </Descriptions.Item>
            {user?.isIntervenant && props.evenement && (
               <>
                  <Descriptions.Item label="Durées">
                     <Space direction="vertical">
                        {props.evenement.tempsPreparation &&
                        props.evenement.tempsPreparation > 0 ? (
                           <Space>
                              <Typography.Text className="fs-09 legende">
                                 Préparation
                              </Typography.Text>
                              <Typography.Text>
                                 {props.evenement.tempsPreparation} minutes
                              </Typography.Text>
                           </Space>
                        ) : null}
                        <Space>
                           <Typography.Text className="fs-09 legende">Évènement</Typography.Text>
                           <Typography.Text>
                              {dayjs(props.evenement.fin).diff(
                                 dayjs(props.evenement.debut),
                                 "minute",
                              )}{" "}
                              minutes
                           </Typography.Text>
                        </Space>
                        {props.evenement.tempsSupplementaire &&
                        props.evenement.tempsSupplementaire > 0 ? (
                           <Space>
                              <Typography.Text type="secondary" className="fs-09">
                                 Supplémentaire
                              </Typography.Text>
                              <Typography.Text>
                                 {props.evenement.tempsSupplementaire} minutes
                              </Typography.Text>
                           </Space>
                        ) : null}

                        {(props.evenement.tempsPreparation &&
                           props.evenement.tempsPreparation > 0) ||
                        (props.evenement.tempsSupplementaire &&
                           props.evenement.tempsSupplementaire > 0) ? (
                           <div className="">
                              soit{" "}
                              <span className="semi-bold">
                                 {dayjs(props.evenement.fin).diff(
                                    dayjs(props.evenement.debut),
                                    "minute",
                                 ) +
                                    (props.evenement.tempsSupplementaire || 0) +
                                    (props.evenement.tempsPreparation || 0)}{" "}
                                 minutes
                              </span>{" "}
                              au total
                           </div>
                        ) : null}
                     </Space>
                  </Descriptions.Item>
                  <Descriptions.Item
                     label={
                        <>
                           Montant brut <sup>*</sup>
                        </>
                     }
                  >
                     <Space>
                        <Typography.Text>
                           <TarifEvenementField evenement={props.evenement} as="text" />
                        </Typography.Text>
                     </Space>
                  </Descriptions.Item>
               </>
            )}
         </Descriptions>
      ),
      [props.evenement, user],
   );
}
