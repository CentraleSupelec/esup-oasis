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
import { ICompetence } from "@api";

interface FilterFieldCompetencesProps {
  filtreIntervenant: FiltreIntervenant;
  setFiltreIntervenant: UseStateDispatch<FiltreIntervenant>;
  competences: { items: ICompetence[] } | undefined;
}

export function FilterFieldCompetences({
  filtreIntervenant,
  setFiltreIntervenant,
  competences,
}: FilterFieldCompetencesProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Compétences</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          mode="tags"
          allowClear
          placeholder="Toutes les compétences"
          className="w-100"
          options={(competences?.items || [])
            .filter((c) => c.actif)
            .map((c) => ({
              label: c.libelle,
              value: c["@id"],
            }))}
          value={filtreIntervenant["intervenant.competences[]"]}
          onChange={(value) => {
            setFiltreIntervenant((prev) => ({
              ...prev,
              "intervenant.competences[]": value,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
