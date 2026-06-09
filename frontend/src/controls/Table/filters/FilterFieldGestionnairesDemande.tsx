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
import { PaginateResult } from "@context/api/ApiProvider";
import { IUtilisateur } from "@api";

interface FilterFieldGestionnairesDemandePProps {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  gestionnaires:
    | PaginateResult<{
        "hydra:member": IUtilisateur[];
      }>
    | undefined;
  isFetchingGestionnaires: boolean;
}

export function FilterFieldGestionnairesDemande({
  filtreDemande,
  setFiltreDemande,
  gestionnaires,
  isFetchingGestionnaires,
}: FilterFieldGestionnairesDemandePProps) {
  if (!gestionnaires) {
    return null;
  }

  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span aria-label="Chargés d'accompagnement">Chargé•es d'accompagnement</span>
          <span className="legende">Pour les bénéficiaires déjà connus</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          placeholder="Tous les chargés d'accompagnement"
          mode="tags"
          allowClear
          loading={isFetchingGestionnaires}
          className="w-100"
          options={gestionnaires?.items.map((g) => ({
            label: `${g.nom?.toLocaleUpperCase()} ${g.prenom}`,
            value: g["@id"],
          }))}
          value={filtreDemande["gestionnaire[]"]}
          onChange={(value) => {
            setFiltreDemande((prev) => ({
              ...prev,
              "gestionnaire[]": value as string[],
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
