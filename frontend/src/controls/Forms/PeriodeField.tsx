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
import dayjs from "dayjs";
import { IPeriode } from "@api";
import { useApi } from "@context/api/ApiProvider";

export default function PeriodeField(props: {
  value?: IPeriode;
  onChange?: (value: IPeriode | IPeriode[] | undefined) => void;
  mode?: "multiple" | "tags";
  placeholder?: string;
  seulementPeriodesEnvoyees?: boolean;
}) {
  const { data: periodes, isFetching } = useApi().useGetFullCollection({
    path: "/periodes",
    query: {
      "order[debut]": "desc",
    },
  });

  return (
    <Select
      className="w-100"
      placeholder={
        props.placeholder || (props.mode ? "Sélectionnez des périodes" : "Sélectionnez une période")
      }
      mode={props.mode}
      options={periodes?.items
        .filter(
          (p) =>
            props.seulementPeriodesEnvoyees === undefined ||
            (props.seulementPeriodesEnvoyees && p.envoyee) ||
            !props.seulementPeriodesEnvoyees,
        )
        .sort((a, b) => dayjs(b.debut).diff(dayjs(a.debut)))
        .map((p) => ({
          label: `Période du ${dayjs(p.debut).format("DD/MM/YYYY")} au ${dayjs(p.fin).format(
            "DD/MM/YYYY",
          )}`,
          value: p["@id"] as string,
        }))}
      loading={isFetching}
      onChange={(value: string | string[]) => {
        if (Array.isArray(value)) {
          props.onChange?.(periodes?.items.filter((p) => value.includes(p["@id"] as string)));
        } else {
          props.onChange?.(periodes?.items.find((p) => p["@id"] === value));
        }
      }}
      value={props.value?.["@id"]}
    />
  );
}
