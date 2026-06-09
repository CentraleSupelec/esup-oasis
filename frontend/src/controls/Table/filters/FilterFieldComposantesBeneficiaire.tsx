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
import { IComposante } from "@api";

interface FilterFieldComposantesBeneficiaireProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
  composantes: { items: IComposante[] } | undefined;
}

export function FilterFieldComposantesBeneficiaire({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
  composantes,
}: FilterFieldComposantesBeneficiaireProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Composantes
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Toutes les composantes"
          value={filtreBeneficiaire["composante[]"]}
          onChange={(value) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              "composante[]": value as string[],
              page: 1,
            }));
          }}
          options={(composantes?.items || []).map((c) => ({
            label: c.libelle,
            value: c["@id"],
          }))}
          showSearch={{ optionFilterProp: "label" }}
        />
      </Col>
    </>
  );
}
