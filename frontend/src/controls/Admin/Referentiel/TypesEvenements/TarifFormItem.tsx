/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Input } from "antd";

interface ITarifFormItem {
  value?: string;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

function TarifFormItem({ value, onChange, style, className }: ITarifFormItem): ReactElement {
  return (
    <Input
      style={style}
      className={className}
      suffix="€"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export default TarifFormItem;
