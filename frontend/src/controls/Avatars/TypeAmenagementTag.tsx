/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_TYPES_AMENAGEMENTS } from "@api";
import Spinner from "@controls/Spinner/Spinner";
import { Tag } from "antd";
import React from "react";

export function TypeAmenagementTag(props: { typeId: undefined | string }) {
  const { data: types } = useApi().useGetFullCollection(PREFETCH_TYPES_AMENAGEMENTS);

  if (!types) return <Spinner />;

  return <Tag>{types?.items.find((c) => c["@id"] === props.typeId)?.libelle}</Tag>;
}
