/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Select } from "antd";
import { IFormation, PREFETCH_FORMATIONS } from "@api";
import { useApi } from "@context/api/ApiProvider";

export default function FormationsField(props: {
  value?: string | string[] | undefined;
  onChange?: (value: IFormation | IFormation[] | undefined) => void;
  mode?: "multiple" | "tags";
  placeholder?: string;
}) {
  const { data: formations, isFetching } = useApi().useGetFullCollection(PREFETCH_FORMATIONS);

  return (
    <Select
      className="w-100"
      placeholder={
        props.placeholder ||
        (props.mode ? "Sélectionnez des formations" : "Sélectionnez une formation")
      }
      mode={props.mode}
      options={formations?.items.map((p) => ({
        label: p.libelle,
        value: p["@id"] as string,
      }))}
      loading={isFetching}
      onChange={(value: string | string[]) => {
        if (Array.isArray(value)) {
          props.onChange?.(formations?.items.filter((p) => value.includes(p["@id"] as string)));
        } else {
          props.onChange?.(formations?.items.find((p) => p["@id"] === value));
        }
      }}
    />
  );
}
