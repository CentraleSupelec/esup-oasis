/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Tag, Tooltip } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

interface IBooleanState {
  value: boolean;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
  onLabel?: string;
  offLabel?: string;
  showIcon?: boolean;
  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;
  colorOn?: string;
  colorOff?: string;
  colors?: string;
  showColor?: boolean;
  bordered?: boolean;
  showTooltip?: boolean;
  tooltip?: string;
}

export default function BooleanState({
  value,
  className,
  style,
  showLabel = true,
  onLabel = "Oui",
  offLabel = "Non",
  showIcon = true,
  iconOn = <CheckOutlined aria-hidden />,
  iconOff = <CloseOutlined aria-hidden />,
  colorOn = "green",
  colorOff = "warning",
  showColor = true,
  bordered = true,
  showTooltip = true,
  tooltip,
}: IBooleanState) {
  const getColor: () => string | undefined = () => {
    if (!showColor) return undefined;
    return value ? colorOn : colorOff;
  };

  function getTooltip() {
    if (!showTooltip) return undefined;
    if (tooltip) {
      return tooltip;
    }
    return value ? onLabel : offLabel;
  }

  return (
    <Tooltip title={getTooltip()}>
      <Tag
        aria-label={value ? onLabel : offLabel}
        className={className}
        color={getColor()}
        style={style}
        icon={showIcon ? (value ? iconOn : iconOff) : undefined}
        variant={!bordered ? "filled" : undefined}
      >
        {showLabel ? (value ? onLabel : offLabel) : false}
      </Tag>
    </Tooltip>
  );
}
