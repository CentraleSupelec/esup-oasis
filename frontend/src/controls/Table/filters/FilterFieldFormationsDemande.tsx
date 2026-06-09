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
import { IFormation } from "@api";

interface FilterFieldFormationsDemandePProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  formations: { items: IFormation[] } | undefined;
}

export function FilterFieldFormationsDemande({
  filtreDemande,
  setFiltreDemande,
  formations,
}: FilterFieldFormationsDemandePProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Formations</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Toutes les formations"
          value={filtreDemande["formation[]"]}
          onChange={(value) => {
            setFiltreDemande((prev) => ({
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
          Seules les formations ayant au moins un demandeur sont proposées.
        </div>
      </Col>
    </>
  );
}
