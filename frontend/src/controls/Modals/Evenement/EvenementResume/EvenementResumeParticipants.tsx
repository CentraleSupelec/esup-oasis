/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Evenement, RoleValues } from "@lib";
import { Descriptions, List } from "antd";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";
import React, { ReactElement, useMemo } from "react";

/**
 * Renders a description list of participants for a given event.
 *
 * @param {Object} props - The props object containing the event information.
 * @param {Evenement} props.evenement - The event object.
 *
 * @return {ReactElement} - The rendered description list of participants.
 */
export function EvenementResumeParticipants(props: {
  evenement: Evenement | undefined;
}): ReactElement {
  return useMemo(
    () => (
      <Descriptions title="Participants" bordered column={1}>
        <Descriptions.Item label="Bénéficiaires">
          {props.evenement?.beneficiaires && (
            <List size="small">
              <ul className="list-nostyle">
                {props.evenement?.beneficiaires.map((beneficiaire) => (
                  <List.Item key={beneficiaire}>
                    <EtudiantItem
                      utilisateurId={beneficiaire}
                      role={RoleValues.ROLE_BENEFICIAIRE}
                    />
                  </List.Item>
                ))}
              </ul>
            </List>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Intervenant">
          <List size="small">
            <ul className="list-nostyle">
              <List.Item>
                {props.evenement?.intervenant ? (
                  <EtudiantItem
                    utilisateurId={props.evenement.intervenant}
                    role={RoleValues.ROLE_INTERVENANT}
                  />
                ) : (
                  "Aucun intervenant actuellement associé à cet événement"
                )}
              </List.Item>
            </ul>
          </List>
        </Descriptions.Item>
        {props.evenement?.enseignants && props.evenement.enseignants.length > 0 && (
          <Descriptions.Item label="Enseignants">
            <List size="small">
              <ul className="list-nostyle">
                {props.evenement?.enseignants.map((enseignant) => (
                  <List.Item key={enseignant}>
                    <GestionnaireItem gestionnaireId={enseignant} />
                  </List.Item>
                ))}
              </ul>
            </List>
          </Descriptions.Item>
        )}
      </Descriptions>
    ),
    [props.evenement],
  );
}
