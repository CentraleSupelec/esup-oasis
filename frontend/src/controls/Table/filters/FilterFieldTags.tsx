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
import { ITag } from "@api";

interface FilterFieldTagsProps {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
  tags: { items: ITag[] } | undefined;
  estRenfort: boolean;
  estReferent: boolean;
}

export function FilterFieldTags({
  filtreAmenagement,
  setFiltreAmenagement,
  tags,
  estRenfort,
  estReferent,
}: FilterFieldTagsProps) {
  if (estRenfort || estReferent) {
    return null;
  }

  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Tags
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          mode="tags"
          className="w-100"
          placeholder="Tous les tags"
          value={filtreAmenagement["tags[]"]}
          onChange={(value) => {
            setFiltreAmenagement((prev) => ({
              ...prev,
              "tags[]": value as string[],
              page: 1,
            }));
          }}
          options={(tags?.items || [])
            .filter((ta) => ta.actif)
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
