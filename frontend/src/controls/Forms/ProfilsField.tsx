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
import { IProfil } from "@api";
import { useApi } from "@context/api/ApiProvider";

export default function ProfilsField(props: {
  value?: string | string[] | undefined;
  onChange?: (value: IProfil | IProfil[] | undefined) => void;
  mode?: "multiple" | "tags";
  placeholder?: string;
  seulementActifs?: boolean;
}) {
  const { data: profils, isFetching } = useApi().useGetFullCollection({
    path: "/profils",
    query: {
      "order[libelle]": "asc",
    },
  });

  return (
    <Select
      className="w-100"
      placeholder={
        props.placeholder || (props.mode ? "Sélectionnez des profils" : "Sélectionnez un profil")
      }
      mode={props.mode}
      options={profils?.items
        .filter((p) => !props.seulementActifs || (props.seulementActifs && p.actif))
        .map((p) => ({
          label: p.libelle,
          value: p["@id"] as string,
        }))}
      loading={isFetching}
      onChange={(value: string | string[]) => {
        if (Array.isArray(value)) {
          props.onChange?.(profils?.items.filter((p) => value.includes(p["@id"] as string)));
        } else {
          props.onChange?.(profils?.items.find((p) => p["@id"] === value));
        }
      }}
    />
  );
}
