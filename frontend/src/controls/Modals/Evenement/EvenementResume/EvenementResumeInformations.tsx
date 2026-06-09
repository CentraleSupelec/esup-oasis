/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Descriptions } from "antd";
import { CampusItem } from "@controls/Items/CampusItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import dayjs from "dayjs";
import React, { ReactElement, useMemo } from "react";
import { Evenement } from "@lib";

/**
 * Generates a description list of general information about an event.
 *
 * @param {Object} props - The props object containing the event data.
 * @param {Evenement} props.evenement - The event object with the relevant information.
 *
 * @returns {ReactElement} - The JSX element for the description list component.
 */
export function EvenementResumeInformations(props: {
  evenement: Evenement | undefined;
}): ReactElement {
  return useMemo(
    () => (
      <Descriptions title="Informations générales" bordered column={1}>
        {props.evenement?.libelle ? (
          <Descriptions.Item label="Évènement">{props.evenement?.libelle}</Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Catégorie">
          <TypeEvenementItem typeEvenementId={props.evenement?.type} forceBlackText />
        </Descriptions.Item>
        <Descriptions.Item label="Date et heure">
          {dayjs(props.evenement?.debut).format("dddd DD MMMM YYYY")} de{" "}
          {dayjs(props.evenement?.debut).format("HH:mm")} à{" "}
          {dayjs(props.evenement?.fin).format("HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Localisation">
          <CampusItem campusId={props.evenement?.campus} salle={props.evenement?.salle} />
        </Descriptions.Item>
      </Descriptions>
    ),
    [props.evenement],
  );
}
