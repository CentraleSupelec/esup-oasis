/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Form, Radio } from "antd";
import React, { ReactElement } from "react";
import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_TYPES_EVENEMENTS } from "@api";

interface ITabCategorie {
  defaultValue?: string;
}

/**
 * Renders a tab for selecting event types using radio buttons.
 * @param {ITabCategorie} props - The props object containing the default value.
 * @param {string} [props.defaultValue] - The default value for the radio buttons.
 * @returns {ReactElement} - The rendered JSX for the tab.
 */
export function TabTypeEvenement({ defaultValue }: ITabCategorie): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  return (
    <>
      <Form.Item name="intervenant.typesEvenements">
        <Radio.Group
          className="checkbox-group-vertical"
          options={data?.items
            .filter((c) => c.actif)
            .map((item) => ({
              label: item.libelle,
              value: item["@id"] as string,
            }))}
          defaultValue={defaultValue}
        />
      </Form.Item>
    </>
  );
}
