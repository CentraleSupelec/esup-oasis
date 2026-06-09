/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Evenement } from "@lib";
import { Space, Tag, Tooltip } from "antd";
import { WarningFilled } from "@ant-design/icons";
import React, { ReactElement } from "react";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { ITypeEvenement } from "@api";

/**
 * Renders the state of an event item and returns an appropriate message.
 *
 * @param {Object} props - The properties object.
 * @param {Evenement} props.evenement - The event object.
 * @param {ITypeEvenement | undefined} props.type - The event type object.
 * @param {React.CSSProperties} [props.style] - The optional CSS style object for the message tag.
 *
 * @return {ReactElement | null} - The message tag component or null if the state is valid.
 */
export function EvenementEtatItem(props: {
  evenement: Evenement;
  type: ITypeEvenement | undefined;
  style?: React.CSSProperties;
}): ReactElement | null {
  function returnMessage(libelle: string, color: string, tooltip: string | undefined) {
    return (
      <Tooltip title={tooltip}>
        <Tag color={color} className="fs-08 mb-1" style={props.style}>
          <Space>
            <WarningFilled />
            <span>{libelle}</span>
          </Space>
        </Tag>
      </Tooltip>
    );
  }

  function returnWarning(libelle: string, tooltip?: string) {
    return returnMessage(libelle, "warning", tooltip);
  }

  function returnError(libelle: string, tooltip?: string) {
    return returnMessage(libelle, "error", tooltip);
  }

  if (!props.evenement.type) {
    return returnError("Aucune catégorie");
  }
  if (!props.evenement.campus) {
    return returnError("Aucun campus");
  }
  if (!props.evenement.debut) {
    return returnError("Aucune planification");
  }
  if (!props.evenement.fin || props.evenement.debut === props.evenement.fin) {
    return returnError("Planification incomplète");
  }
  if (props.evenement.debut && props.evenement.fin && props.evenement.debut > props.evenement.fin) {
    return returnError("Planification incorrecte");
  }
  if (
    props.type &&
    props.type["@id"] !== TYPE_EVENEMENT_RENFORT &&
    (props.evenement.beneficiaires || []).filter((b) => b).length === 0
  ) {
    return returnError("Aucun bénéficiaire");
  }

  if (!props.evenement.intervenant) {
    if (props.evenement.type === TYPE_EVENEMENT_RENFORT) {
      return returnWarning("Aucun renfort");
    }
    return returnWarning("Aucun intervenant");
  }
  if (!props.type?.tauxActif) {
    return returnWarning("Aucun taux horaire", "Contactez l'administrateur de l'application");
  }

  if (
    props.type &&
    props.type["@id"] === TYPE_EVENEMENT_RENFORT &&
    !props.evenement.dateValidation
  ) {
    return returnWarning(
      "Attente validation",
      "Validation réalisée par le chargé d'accompagnement",
    );
  }
  return null;
}
