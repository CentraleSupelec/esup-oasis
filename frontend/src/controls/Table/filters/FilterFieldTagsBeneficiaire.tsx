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
import { ITag } from "@api";

interface FilterFieldTagsBeneficiaireProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
  tags: { items: ITag[] } | undefined;
}

export function FilterFieldTagsBeneficiaire({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
  tags,
}: FilterFieldTagsBeneficiaireProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Tags
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Tous les tags"
          value={filtreBeneficiaire["tags[]"]}
          onChange={(value) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              "tags[]": value as string[],
              page: 1,
            }));
          }}
          options={(tags?.items || []).map((c) => ({
            label: c.libelle,
            value: c["@id"],
          }))}
          showSearch={{ optionFilterProp: "label" }}
        />
      </Col>
    </>
  );
}
