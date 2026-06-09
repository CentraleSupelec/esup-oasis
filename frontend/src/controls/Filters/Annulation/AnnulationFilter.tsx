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

interface IAnnulationFilter {
  value: AnnulationFilterValues;
  setValue: (value: AnnulationFilterValues) => void;
}

export enum AnnulationFilterValues {
  Tous = "tous",
  EnCours = "encours",
  Annules = "annules",
}

/**
 * Filter component for Annulation.
 *
 * @param {Object} options - The options object.
 * @param {AnnulationFilterValues} options.value - The current value of the filter.
 * @param {function} options.setValue - The callback function to set the value of the filter.
 *
 * @return {ReactElement} The UI component for Annulation Filter.
 */
export default memo(
  function AnnulationFilter({ value, setValue }: IAnnulationFilter): ReactElement {
    return (
      <>
        <Segmented
          className="mt-1"
          data-testid="annulation-filter"
          options={[
            {
              label: (
                <Tooltip title="Tous : évènements en cours et annulés">
                  <Icon component={Asterisk} aria-label="Tous : évènements en cours et annulés" />
                </Tooltip>
              ),
              value: AnnulationFilterValues.Tous,
            },
            { label: "En cours", value: AnnulationFilterValues.EnCours },
            { label: "Annulés", value: AnnulationFilterValues.Annules },
          ]}
          value={value || AnnulationFilterValues.EnCours}
          onChange={(data) => setValue(data as AnnulationFilterValues)}
        />
      </>
    );
  },
  (prevProps, nextProps) => prevProps.value === nextProps.value,
);
