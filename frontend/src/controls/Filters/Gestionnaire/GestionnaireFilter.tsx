/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { Select } from "antd";
import { useApi } from "@context/api/ApiProvider";

interface IGestionnaireFilter {
  value?: string[];
  setValue: (value: string[]) => void;
}

/**
 * Filter component for Gestionnaire.
 *
 * @param {object} options - The options for filtering and rendering the Select component.
 * @param {string} options.value - The currently selected value for the Select component.
 * @param {function} options.setValue - A function to set the selected value for the Select component.
 *
 * @return {ReactElement} The Select component with the filtered options.
 */
export default function GestionnaireFilter({ value, setValue }: IGestionnaireFilter): ReactElement {
  const [filter, setFilter] = useState("");
  // Récupération de la liste des gestionnaires (dont renforts)
  const { data: gestionnaires, isFetching } = useApi().useGetFullCollection({
    path: "/roles/{roleId}/utilisateurs",
    parameters: { roleId: "/roles/ROLE_PLANIFICATEUR" },
    query: { "order[nom]": "asc" },
  });

  return (
    <Select
      className="w-100"
      options={gestionnaires?.items
        .filter(
          (c) =>
            c.nom?.toLocaleLowerCase().includes(filter) ||
            c.prenom?.toLocaleLowerCase().includes(filter),
        )
        .map((g) => ({
          label: `${g.nom?.toLocaleUpperCase()} ${g.prenom}`,
          value: g["@id"],
        }))}
      loading={isFetching}
      placeholder="Tous les gestionnaires"
      value={value}
      onChange={(data) => setValue(data)}
      allowClear
      showSearch={{
        filterOption: false,
        onSearch: (v) => setFilter(v.toLocaleLowerCase()),
      }}
      mode="tags"
    />
  );
}
