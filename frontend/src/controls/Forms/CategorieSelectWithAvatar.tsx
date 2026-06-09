/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_TYPES_EVENEMENTS } from "@api";
import { Col, Form, Row, Select } from "antd";
import { TypeEvenementAvatar } from "@controls/Avatars/TypeEvenementAvatar";
import React from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

interface TabEvenenentInformationsCategorieProps {
  typeSelectionne: string | undefined;
  setTypeSelectionne: (type: string | undefined) => void;
  forfait?: boolean;
}

export function CategorieSelectWithAvatar({
  typeSelectionne,
  setTypeSelectionne,
  forfait = false,
}: TabEvenenentInformationsCategorieProps) {
  const screens = useBreakpoint();
  const { data: categories, isFetching: isFetchingCategories } = useApi().useGetFullCollection({
    ...PREFETCH_TYPES_EVENEMENTS,
    query: {
      ...PREFETCH_TYPES_EVENEMENTS.query,
      forfait,
    },
  });

  return (
    <Row>
      <Col xs={24} sm={24} md={24} lg={23}>
        <Form.Item name="type" label="Catégorie" rules={[{ required: true }]} required>
          <Select
            loading={isFetchingCategories}
            placeholder="Sélectionnez une catégorie"
            options={categories?.items
              .filter((c) => c.actif)
              .map((c) => ({
                label: c.libelle,
                value: c["@id"],
                className: `text-${c.couleur}-dark`,
              }))}
            onSelect={(value) => {
              setTypeSelectionne(value);
            }}
            className={`semi-bold text-${
              categories?.items.find((c) => c["@id"] === typeSelectionne)?.couleur
            }-dark`}
          />
        </Form.Item>
      </Col>
      {screens.lg && (
        <Col xs={0} sm={0} md={0} lg={1} className="d-flex-center">
          {typeSelectionne && (
            <TypeEvenementAvatar typeEvenementId={typeSelectionne} size={20} className="mt-2" />
          )}
        </Col>
      )}
    </Row>
  );
}
