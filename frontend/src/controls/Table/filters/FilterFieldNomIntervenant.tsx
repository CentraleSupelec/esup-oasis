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
import { FiltreIntervenant } from "@controls/Table/IntervenantTable";
import { UseStateDispatch } from "@utils/utils";

interface FilterFieldNomIntervenantProps {
  filtreIntervenant: FiltreIntervenant;
  setFiltreIntervenant: UseStateDispatch<FiltreIntervenant>;
}

export function FilterFieldNomIntervenant({
  filtreIntervenant,
  setFiltreIntervenant,
}: FilterFieldNomIntervenantProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Nom de l'intervenant
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Input
          allowClear
          placeholder="Nom de l'intervenant"
          value={filtreIntervenant.nom}
          onChange={(e) => {
            setFiltreIntervenant((prev) => ({
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
