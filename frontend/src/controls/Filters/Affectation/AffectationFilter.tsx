/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Segmented, Tooltip } from "antd";
import Asterisk from "@/assets/images/asterisk.svg?react";
import Icon from "@ant-design/icons";

interface IAffectationFilter {
  value: AffectationFilterValues;
  setValue: (value: AffectationFilterValues) => void;
}

export enum AffectationFilterValues {
  Tous = "undefined",
  Affectes = "affecte",
  NonAffectes = "non-affecte",
}

/**
 * Filter component for Affectation.
 *
 * @param {IAffectationFilter} props - The filter properties.
 * @param {AffectationFilterValues} props.value - The selected filter value.
 * @param {Function} props.setValue - The function to set the filter value.
 *
 * @returns {ReactElement} The affectation filter component.
 */
export default memo(
  function AffectationFilter({ value, setValue }: IAffectationFilter): ReactElement {
    return (
      <Segmented
        className="mt-1"
        data-testid="affectation-filter"
        options={[
          {
            label: (
              <Tooltip title="Tous : évènements affectés et non affectés">
                <Icon
                  component={Asterisk}
                  aria-label="Tous : évènements affectés et non affectés"
                />
              </Tooltip>
            ),
            value: AffectationFilterValues.Tous,
          },
          { label: "Affectés", value: AffectationFilterValues.Affectes },
          { label: "Non affectés", value: AffectationFilterValues.NonAffectes },
        ]}
        value={value || AffectationFilterValues.Tous}
        onChange={(data) => setValue(data as AffectationFilterValues)}
      />
    );
  },
  (prevProps, nextProps) => prevProps.value === nextProps.value,
);
