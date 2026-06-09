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
import { PREFETCH_COMPETENCES } from "@api";

interface ITabCompetence {
  defaultValue?: string;
}

/**
 * Renders a radio group of competences for a form item.
 *
 * @param {Object} props - The input props object.
 * @param {string} [props.defaultValue] - The default value for the selected competences.
 *
 * @returns {ReactElement} - The rendered tab component.
 */
export function TabCompetence({ defaultValue }: ITabCompetence): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_COMPETENCES);

  return (
    <>
      <Form.Item name="intervenant.competences">
        <Radio.Group
          className="checkbox-group-vertical"
          options={data?.items
            .filter((c) => c.actif)
            .map((item) => ({
              label: item.libelle,
              value: item["@id"] as string,
              disabled: !item.actif,
            }))}
          defaultValue={defaultValue}
        />
      </Form.Item>
    </>
  );
}
