/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

interface ISpinner {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Represents a Spinner component.
 *
 * @param {Object} [size] - The size of the spinner.
 * @param style
 * @param className
 * @returns {ReactElement} - The rendered Spinner component.
 */
const Spinner = ({ size, style, className }: ISpinner): ReactElement => (
  <Spin
    className={`spinner text-primary ${className}`}
    aria-label="Chargement en cours"
    indicator={<LoadingOutlined style={{ ...style, ...{ fontSize: size || 24 } }} />}
  />
);

export default Spinner;
