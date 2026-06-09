/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { MinusOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import React from "react";

export function GenreItem(props: { genre: string | null | undefined }) {
  if (!props.genre) return <MinusOutlined />;

  if (props.genre === "M") return <Tag>Masculin</Tag>;
  if (props.genre === "F") return <Tag>Féminin</Tag>;

  return null;
}
