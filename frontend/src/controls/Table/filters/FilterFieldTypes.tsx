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
import { ITypeAmenagement } from "@api";
import { getDomaineAmenagement } from "@lib";

interface FilterFieldTypesProps {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
  typesAmenagements: { items: ITypeAmenagement[] } | undefined;
  estRenfort: boolean;
  estReferent: boolean;
}

export function FilterFieldTypes({
  filtreAmenagement,
  setFiltreAmenagement,
  typesAmenagements,
  estRenfort,
  estReferent,
}: FilterFieldTypesProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Types
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Tous les types"
          value={filtreAmenagement["type[]"]}
          onChange={(value) => {
            setFiltreAmenagement((prev) => ({
              ...prev,
              "type[]": value as string[],
              page: 1,
            }));
          }}
          options={(typesAmenagements?.items || [])
            .filter((t) => t.actif)
            // Seulement ce qui est visible pour le profil de l'utilisateur
            .filter((t) => {
              const infos = getDomaineAmenagement(t);
              return (
                (!estRenfort || infos?.visibleRenfort) && (!estReferent || infos?.visibleReferent)
              );
            })
            // Le domaine sélectionné
            .filter(
              (t) =>
                filtreAmenagement.domaine === "Tous" ||
                getDomaineAmenagement(t)?.id === filtreAmenagement.domaine,
            )
            .sort((a, b) => (a.libelle || "").localeCompare(b.libelle || ""))
            .map((c) => ({
              label: c.libelle,
              value: c["@id"],
            }))}
          showSearch={{ optionFilterProp: "label" }}
        />
      </Col>
    </>
  );
}
