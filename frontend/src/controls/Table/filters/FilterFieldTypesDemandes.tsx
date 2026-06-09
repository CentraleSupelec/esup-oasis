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
import { ITypeDemande } from "@api";

interface FilterFieldTypesDemandesProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  types: { items: ITypeDemande[] } | undefined;
}

export function FilterFieldTypesDemandes({
  filtreDemande,
  setFiltreDemande,
  types,
}: FilterFieldTypesDemandesProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Types de demande</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          placeholder="Tous les types"
          mode="tags"
          allowClear
          className="w-100"
          style={{ overflowX: "auto", maxWidth: "100%" }}
          onChange={(value) => {
            setFiltreDemande((prev) => ({
              ...prev,
              etat: undefined,
              "campagne.typeDemande[]": value as string[],
              page: 1,
            }));
          }}
          value={filtreDemande["campagne.typeDemande[]"] || []}
          options={(types?.items || [])
            .filter((t) => t.actif)
            .map((e) => ({
              label: e?.libelle,
              value: e?.["@id"],
            }))}
        />
      </Col>
    </>
  );
}
