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
import { ICategorieAmenagement, ITypeAmenagement } from "@api";
import { getDomaineAmenagement, Utilisateur } from "@lib";

interface FilterFieldCategoriesProps {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
  categoriesAmenagements: { items: ICategorieAmenagement[] } | undefined;
  typesAmenagements: { items: ITypeAmenagement[] } | undefined;
  user: Utilisateur | null | undefined;
  estRenfort: boolean;
  estReferent: boolean;
}

export function FilterFieldCategories({
  filtreAmenagement,
  setFiltreAmenagement,
  categoriesAmenagements,
  typesAmenagements,
  user,
  estRenfort,
  estReferent,
}: FilterFieldCategoriesProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Catégories
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Toutes les catégories"
          value={filtreAmenagement["categorie[]"]}
          onChange={(value) => {
            setFiltreAmenagement((prev) => ({
              ...prev,
              "categorie[]": value as string[],
              "type[]": [],
              page: 1,
            }));
          }}
          options={(categoriesAmenagements?.items || [])
            .filter((ca) => ca.actif)
            // Seulement ce qui est visible pour le profil de l'utilisateur
            .filter((ca) => {
              return typesAmenagements?.items.some((ta) => {
                const infos = getDomaineAmenagement(ta);
                return (
                  ta.categorie === ca["@id"] &&
                  ta.actif &&
                  (user?.isGestionnaire ||
                    (estRenfort && infos?.visibleRenfort) ||
                    (estReferent && infos?.visibleReferent))
                );
              });
            })
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
