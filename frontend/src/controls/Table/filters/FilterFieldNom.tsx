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
import { FiltreAmenagement } from "@controls/Table/AmenagementTableLayout";

interface FilterFieldNomProps {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
}

export function FilterFieldNom({ filtreAmenagement, setFiltreAmenagement }: FilterFieldNomProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Nom du bénéficiaire
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Input
          allowClear
          placeholder="Nom du bénéficiaire"
          value={filtreAmenagement.nom}
          onChange={(e) => {
            setFiltreAmenagement((prev) => ({
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
