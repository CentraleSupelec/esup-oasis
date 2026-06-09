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
import { IFormation } from "@api";

interface FilterFieldFormationsBeneficiaireProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
  formations: { items: IFormation[] } | undefined;
}

export function FilterFieldFormationsBeneficiaire({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
  formations,
}: FilterFieldFormationsBeneficiaireProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Formations
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Toutes les formations"
          value={filtreBeneficiaire["formation[]"]}
          onChange={(value) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              "formation[]": value as string[],
              page: 1,
            }));
          }}
          options={(formations?.items || []).map((c) => ({
            label: `[${c.codeExterne?.replace("#", "-")}] ${c.libelle}`,
            value: c["@id"],
          }))}
          showSearch={{ optionFilterProp: "label" }}
        />
        <div className="legende">
          Seules les formations ayant au moins un bénéficiaire sont proposées.
        </div>
      </Col>
    </>
  );
}
