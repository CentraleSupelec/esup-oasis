/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { IEvenement } from "@api";

/**
 * Renders the status of sending an event to the RH
 *
 * @param {Object} props - The properties passed to the component.
 * @param {IEvenement} props.evenement - The event data.
 * @returns {ReactElement} - The rendered component based on the event's state of being sent to RH or not.
 */
export function EvenementEtatEnvoiRHItem(props: { evenement: IEvenement }): ReactElement {
  if (props.evenement.dateEnvoiRH)
    return (
      <Tag color="green" icon={<CheckOutlined />}>
        Envoyé à la RH
      </Tag>
    );

  return (
    <Tag color="warning" icon={<CloseOutlined />}>
      Non envoyé à la RH
    </Tag>
  );
}
