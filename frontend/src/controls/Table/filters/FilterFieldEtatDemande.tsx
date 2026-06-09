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
import { IEtatDemande } from "@api";
import { getEtatDemandeInfo } from "@lib";

interface FilterFieldEtatDemandeProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  etats: { items: IEtatDemande[] } | undefined;
}

export function FilterFieldEtatDemande({
  filtreDemande,
  setFiltreDemande,
  etats,
}: FilterFieldEtatDemandeProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>États de la demande</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          placeholder="Tous les états"
          mode="tags"
          allowClear
          className="w-100"
          style={{ overflowX: "auto", maxWidth: "100%" }}
          onChange={(value) => {
            setFiltreDemande((prev) => ({
              ...prev,
              etat: undefined,
              "etat[]": value as string[],
              page: 1,
            }));
          }}
          value={filtreDemande["etat[]"] || []}
          options={(etats?.items || [])
            .sort((a, b) => {
              const aInfo = getEtatDemandeInfo(a["@id"] as string);
              const bInfo = getEtatDemandeInfo(b["@id"] as string);
              return (aInfo?.ordre || 0) - (bInfo?.ordre || 0);
            })
            .map((e) => {
              const eInfo = getEtatDemandeInfo(e["@id"] as string);
              return {
                label: e?.libelle,
                value: e?.["@id"],
                icon: eInfo?.icone,
              };
            })}
        />
      </Col>
    </>
  );
}
