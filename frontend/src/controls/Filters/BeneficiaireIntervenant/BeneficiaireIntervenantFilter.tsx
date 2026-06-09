/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useMemo, useState } from "react";
import { Select } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { RoleValues } from "@lib";
import { UtilisateurAsString } from "@controls/Items/UtilisateurAsString";

interface IBeneficiaireIntervenantFilterFilter {
  value?: string;
  onChange?: (
    utilisateurId?: string,
    role?: RoleValues.ROLE_INTERVENANT | RoleValues.ROLE_BENEFICIAIRE,
  ) => void;
  mode?: "multiple" | "tags";
}

/**
 * Filter component for Beneficiaires + Intervenants.
 *
 * @param {Object} props - The props object
 * @param {string} props.value - The currently selected value of the filter
 * @param {function} props.onChange - The callback function to be called when the value of the filter changes
 *
 * @return {ReactElement} The JSX element representing the BeneficiaireIntervenantFilter component
 */
export default function BeneficiaireIntervenantFilter({
  value,
  onChange,
  mode,
}: IBeneficiaireIntervenantFilterFilter): ReactElement {
  const [recherche, setRecherche] = useState("");
  const { data: beneficiaires, isFetching: isFetchingBeneficiaire } = useApi().useGetCollection({
    path: "/beneficiaires",
    query: {
      recherche,
    },
    enabled: recherche.length > 1,
  });
  const { data: intervenants, isFetching: isFetchingIntervenant } = useApi().useGetCollection({
    path: "/intervenants",
    query: {
      recherche,
    },
    enabled: recherche.length > 1,
  });

  const options = useMemo(() => {
    const result = [];

    // Bénéficiaires group
    if ((beneficiaires?.items || []).filter((i) => i["@id"] !== value).length > 0) {
      result.push({
        label: "Bénéficiaires",
        key: "beneficiaires",
        options:
          beneficiaires?.items
            .filter((i) => i["@id"] !== value?.split("§")[1])
            .map((b) => ({
              key: `${RoleValues.ROLE_BENEFICIAIRE}§${b["@id"]}`,
              value: `${RoleValues.ROLE_BENEFICIAIRE}§${b["@id"]}`,
              label: `${b.nom?.toUpperCase()} ${b.prenom}`,
            })) ?? [],
      });
    }

    // Intervenants group
    if ((intervenants?.items || []).filter((i) => i["@id"] !== value).length > 0) {
      result.push({
        label: "Intervenants",
        key: "intervenants",
        options:
          intervenants?.items
            .filter((i) => i["@id"] !== value?.split("§")[1])
            .map((b) => ({
              key: `${RoleValues.ROLE_INTERVENANT}§${b["@id"]}`,
              value: `${RoleValues.ROLE_INTERVENANT}§${b["@id"]}`,
              label: `${b.nom?.toUpperCase()} ${b.prenom}`,
            })) ?? [],
      });
    }

    // Current selection group
    if (value) {
      result.push({
        label: "Votre sélection",
        key: "selection",
        options: [
          {
            key: value,
            value: value,
            label: <UtilisateurAsString utilisateurId={value.split("§")[1]} />,
          },
        ],
      });
    }

    return result;
  }, [beneficiaires, intervenants, value]);

  return (
    <Select
      data-testid="beneficiaire-intervenant-filter"
      className="w-100 selector-max-height-32"
      loading={isFetchingBeneficiaire || isFetchingIntervenant}
      placeholder="Tous les bénéficiaires et intervenants"
      value={value ? [value] : undefined}
      notFoundContent={
        isFetchingBeneficiaire || isFetchingIntervenant
          ? "Recherche..."
          : recherche.length > 1
            ? "Aucun résultat"
            : "2 caractères minimum"
      }
      onChange={(v) => {
        if (onChange) {
          if (v?.length > 0 && v[v.length - 1]?.includes("utilisateurs")) {
            onChange(
              v[v.length - 1].split("§")[1],
              v[v.length - 1].split("§")[0] === RoleValues.ROLE_INTERVENANT
                ? RoleValues.ROLE_INTERVENANT
                : RoleValues.ROLE_BENEFICIAIRE,
            );
          } else {
            onChange(undefined, undefined);
          }
        }
      }}
      allowClear
      showSearch={{
        filterOption: false,
        onSearch: (v) => setRecherche(v.toLocaleLowerCase()),
      }}
      mode={mode}
      options={options}
    />
  );
}
