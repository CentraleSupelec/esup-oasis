/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Select, Space } from "antd";
import { FiltreIntervenant } from "@controls/Table/IntervenantTable";
import { UseStateDispatch } from "@utils/utils";

interface FilterFieldStatutIntervenantProps {
  filtreIntervenant: FiltreIntervenant;
  setFiltreIntervenant: UseStateDispatch<FiltreIntervenant>;
}

export function FilterFieldStatutIntervenant({
  filtreIntervenant,
  setFiltreIntervenant,
}: FilterFieldStatutIntervenantProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Statut</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          placeholder="Tous les intervenants"
          className="w-100"
          options={[
            {
              label: "Intervenants actifs (et futurs actifs)",
              value: false,
            },
            {
              label: "Intervenants archivés",
              value: true,
            },
          ]}
          value={filtreIntervenant.intervenantArchive}
          onChange={(value) => {
            setFiltreIntervenant((prev) => ({
              ...prev,
              intervenantArchive: value,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
