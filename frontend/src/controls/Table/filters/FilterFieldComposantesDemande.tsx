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
import { IComposante } from "@api";

interface FilterFieldComposantesDemandePProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  composantes: { items: IComposante[] } | undefined;
}

export function FilterFieldComposantesDemande({
  filtreDemande,
  setFiltreDemande,
  composantes,
}: FilterFieldComposantesDemandePProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Composantes</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Toutes les composantes"
          value={filtreDemande["composante[]"]}
          onChange={(value) => {
            setFiltreDemande((prev) => ({
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
