/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import React from "react";
import { Flex, Switch, Tooltip } from "antd";

interface FiltreSessionSwitchProps {
  id: string;
  enabled: boolean;
  toggle: (value: boolean) => void;
}

export function FiltreSessionSwitch({ id, enabled, toggle }: FiltreSessionSwitchProps) {
  return (
    <Tooltip title="Conserver les filtres durant la navigation" placement="left">
      <Flex gap="small" align="center">
        <Switch id={id} size="small" checked={enabled} onChange={toggle} />
        <label htmlFor={id} style={{ cursor: "pointer" }}>
          Conserver les filtres
        </label>
      </Flex>
    </Tooltip>
  );
}
