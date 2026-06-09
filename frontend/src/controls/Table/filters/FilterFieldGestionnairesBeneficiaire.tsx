/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Select } from "antd";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";
import { PaginateResult } from "@context/api/ApiProvider";
import { IUtilisateur } from "@api";

interface FilterFieldGestionnairesBeneficiaireProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
  gestionnaires:
    | PaginateResult<{
        "hydra:member": IUtilisateur[];
      }>
    | undefined;
  isFetchingGestionnaires: boolean;
}

export function FilterFieldGestionnairesBeneficiaire({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
  gestionnaires,
  isFetchingGestionnaires,
}: FilterFieldGestionnairesBeneficiaireProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <span aria-label="Chargés d'accompagnement">Chargé•es d'accompagnement</span>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          placeholder="Tous les chargés d'accompagnement"
          mode="tags"
          allowClear
          loading={isFetchingGestionnaires}
          className="w-100"
          options={gestionnaires?.items.map((g) => ({
            label: `${g.nom?.toLocaleUpperCase()} ${g.prenom}`,
            value: g["@id"],
          }))}
          value={filtreBeneficiaire["gestionnaire[]"]}
          onChange={(value) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              nomGestionnaire: undefined,
              "gestionnaire[]": value.length === 0 ? undefined : value,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
