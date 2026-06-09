/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Input } from "antd";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";

interface FilterFieldNomBeneficiaireProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
}

export function FilterFieldNomBeneficiaire({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
}: FilterFieldNomBeneficiaireProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Nom du bénéficiaire
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Input
          allowClear
          placeholder="Nom du bénéficiaire"
          value={filtreBeneficiaire.nom}
          onChange={(e) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              nom: e.target.value,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
