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
import { IComposante, PREFETCH_COMPOSANTES } from "@api";
import { useApi } from "@context/api/ApiProvider";

export default function ComposantesField(props: {
  value?: string | string[] | undefined;
  onChange?: (value: IComposante | IComposante[] | undefined) => void;
  mode?: "multiple" | "tags";
  placeholder?: string;
}) {
  const { data: composantes, isFetching } = useApi().useGetFullCollection(PREFETCH_COMPOSANTES);

  return (
    <Select
      className="w-100"
      placeholder={
        props.placeholder ||
        (props.mode ? "Sélectionnez des composantes" : "Sélectionnez une composante")
      }
      mode={props.mode}
      options={composantes?.items.map((p) => ({
        label: p.libelle,
        value: p["@id"] as string,
      }))}
      loading={isFetching}
      onChange={(value: string | string[]) => {
        if (Array.isArray(value)) {
          props.onChange?.(composantes?.items.filter((p) => value.includes(p["@id"] as string)));
        } else {
          props.onChange?.(composantes?.items.find((p) => p["@id"] === value));
        }
      }}
    />
  );
}
