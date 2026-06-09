/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Tooltip } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { IEvenement } from "@api";

interface IItemIconeEnvoiRHProps {
  evenement: IEvenement;
}

/**
 * Renders an icon for the RH state based on the provided event.
 *
 * @param {IEvenement} evenement - The event object.
 *
 * @return {ReactElement} - The JSX element representing the icon.
 */
export function EvenementIconeEnvoiRhItem({ evenement }: IItemIconeEnvoiRHProps): ReactElement {
  if (evenement.dateEnvoiRH)
    return (
      <Tooltip title={`Envoyé à la RH le ${dayjs(evenement.dateEnvoiRH).format("DD/MM/YYYY")}`}>
        <CheckOutlined />
      </Tooltip>
    );

  return (
    <Tooltip title="Non envoyé à la RH">
      <CloseOutlined />
    </Tooltip>
  );
}
