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
import { IUtilisateur } from "@api";
import { useApi } from "@context/api/ApiProvider";
import { RoleValues } from "@lib";

export default function GestionnairesField(props: {
  value?: string | string[] | undefined;
  onChange?: (value: IUtilisateur | IUtilisateur[] | undefined) => void;
  mode?: "multiple" | "tags";
  placeholder?: string;
}) {
  const { data: utilisateurs, isFetching } = useApi().useGetFullCollection({
    path: "/roles/{roleId}/utilisateurs",
    parameters: {
      roleId: `/roles/${RoleValues.ROLE_GESTIONNAIRE}`,
    },
    query: {
      "order[nom]": "asc",
    },
  });

  return (
    <Select
      className="w-100"
      placeholder={
        props.placeholder ||
        (props.mode ? "Sélectionnez des utilisateurs" : "Sélectionnez un utilisateur")
      }
      mode={props.mode}
      options={utilisateurs?.items.map((p) => ({
        label: `${p.nom?.toLocaleUpperCase()} ${p.prenom}`,
        value: p["@id"] as string,
      }))}
      loading={isFetching}
      onChange={(value: string | string[]) => {
        if (Array.isArray(value)) {
          props.onChange?.(utilisateurs?.items.filter((p) => value.includes(p["@id"] as string)));
        } else {
          props.onChange?.(utilisateurs?.items.find((p) => p["@id"] === value));
        }
      }}
    />
  );
}
