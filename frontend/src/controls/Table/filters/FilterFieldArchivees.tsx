/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Space, Switch } from "antd";
import { FiltreDemande } from "@controls/Table/DemandeTable";
import { UseStateDispatch } from "@utils/utils";

interface FilterFieldArchiveesProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
}

export function FilterFieldArchivees({
  filtreDemande,
  setFiltreDemande,
}: FilterFieldArchiveesProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span aria-label="Afficher les campagnes archivées">Afficher campagnes archivées</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Switch
          checked={filtreDemande.archivees}
          onChange={(checked) => {
            setFiltreDemande((prev) => ({
              ...prev,
              archivees: checked,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
