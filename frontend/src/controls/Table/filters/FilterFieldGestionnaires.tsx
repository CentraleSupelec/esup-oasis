/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Select } from "antd";
import { FiltreAmenagement } from "@controls/Table/AmenagementTableLayout";
import { Utilisateur } from "@lib";
import { PaginateResult } from "@context/api/ApiProvider";
import { IUtilisateur } from "@api";

interface FilterFieldGestionnairesProps {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
  gestionnaires:
    | PaginateResult<{
        "hydra:member": IUtilisateur[];
      }>
    | undefined;
  isFetchingGestionnaires: boolean;
  user: Utilisateur | null | undefined;
}

export function FilterFieldGestionnaires({
  filtreAmenagement,
  setFiltreAmenagement,
  gestionnaires,
  isFetchingGestionnaires,
  user,
}: FilterFieldGestionnairesProps) {
  if (!user?.isPlanificateur && !user?.isRenfort) {
    return null;
  }

  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <span aria-label="Chargés d'accompagnement">Chargé•es d'accompagnement</span>
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
          value={filtreAmenagement["gestionnaire[]"]}
          onChange={(value) => {
            setFiltreAmenagement((prev) => ({
              ...prev,
              nomGestionnaire: undefined,
              "gestionnaire[]": value.length === 0 ? undefined : value,
              page: 1,
            }));
          }}
        />
      </Col>
    </>
  );
}
