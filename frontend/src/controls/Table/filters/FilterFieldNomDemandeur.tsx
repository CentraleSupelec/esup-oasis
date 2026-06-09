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
import { FiltreDemande } from "@controls/Table/DemandeTable";
import { UseStateDispatch } from "@utils/utils";

interface FilterFieldNomDemandeurProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
}

export function FilterFieldNomDemandeur({
  filtreDemande,
  setFiltreDemande,
}: FilterFieldNomDemandeurProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Nom du demandeur
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Input
          allowClear
          placeholder="Nom du demandeur"
          value={filtreDemande["demandeur.nom"]}
          onChange={(e) => {
            setFiltreDemande((prev) => ({
              ...prev,
              "demandeur.nom": e.target.value,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
