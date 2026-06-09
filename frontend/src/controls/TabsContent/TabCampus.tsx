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
import { PREFETCH_CAMPUS } from "@api";

interface ITabCampus {
  defaultValue?: string;
}

/**
 * Renders a radio group of campuses for a form item.
 * Only one campus can be selected.
 *
 * @param {Object} props - The properties for the component.
 * @param {string} [props.defaultValue] - The default value for the radio group.
 *
 * @return {ReactElement} The rendered radio group component.
 */
export function TabCampus({ defaultValue }: ITabCampus): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_CAMPUS);

  return (
    <>
      <Form.Item name="intervenant.campuses">
        <Radio.Group
          className="checkbox-group-vertical"
          defaultValue={defaultValue}
          options={data?.items
            .filter((c) => c.actif)
            .map((item) => ({
              label: item.libelle,
              value: item["@id"] as string,
              disabled: !item.actif,
            }))}
        />
      </Form.Item>
    </>
  );
}
