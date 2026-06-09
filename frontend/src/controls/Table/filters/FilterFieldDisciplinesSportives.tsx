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
import { FiltreDemande } from "@controls/Table/DemandeTable";
import { UseStateDispatch } from "@utils/utils";
import { IDiscipline } from "@api";
import { PaginateResult } from "@context/api/ApiProvider";

interface FilterFieldDisciplinesSportivesProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  disciplines:
    | PaginateResult<{
        "hydra:member": IDiscipline[];
      }>
    | undefined;
}

export function FilterFieldDisciplinesSportives({
  filtreDemande,
  setFiltreDemande,
  disciplines,
}: FilterFieldDisciplinesSportivesProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Disciplines sportives</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Toutes les disciplines"
          value={filtreDemande["discipline[]"]}
          onChange={(value) => {
            setFiltreDemande((prev) => ({
              ...prev,
              "discipline[]": value as string[],
              page: 1,
            }));
          }}
          options={(disciplines?.items || []).map((c) => ({
            label: c.libelle,
            value: c["@id"],
          }))}
          showSearch={{ optionFilterProp: "label" }}
        />
      </Col>
    </>
  );
}
