/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Checkbox, Form } from "antd";
import React, { ReactElement } from "react";
import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_TYPES_EQUIPEMENTS } from "@api";

/**
 * Retrieves a collection of equipment items from the API and displays them as checkboxes in a form.
 *
 * @return {ReactElement} The JSX code to render the equipment checkboxes.
 */
export function TabEquipement(): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_TYPES_EQUIPEMENTS);

  return (
    <>
      <div className="semi-bold mb-2">
        Aménagements d'examens{" "}
        <span style={{ textDecoration: "underline" }}>spécifiques à cet évènement</span>
      </div>
      <Form.Item name="equipements">
        <Checkbox.Group
          className="checkbox-group-vertical"
          options={data?.items
            .filter((e) => e.actif)
            .map((item) => ({ label: item.libelle, value: item["@id"] as string }))}
        />
      </Form.Item>
    </>
  );
}
