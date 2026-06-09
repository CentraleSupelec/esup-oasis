/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Skeleton, Statistic as AntStatistic, Tooltip } from "antd";
import CountUp from "react-countup";
import { CaretDownOutlined, CaretUpOutlined, PauseOutlined } from "@ant-design/icons";
import "@routes/intervenant/dashboard/Dashboard.scss";

const formatter = (value: number | string) => (
  <CountUp end={typeof value === "string" ? parseInt(value) : value} separator="," />
);

interface IStatisticProps {
  title: string | React.ReactNode;
  value: number;
  precision?: number;
  evolution?: number;
  prefix?: React.ReactNode;
  isFetching?: boolean;
}

export function EvolutionComponent(props: { evolution: number | undefined }): ReactElement {
  let evolutionCmp = <></>;

  if (props.evolution) {
    // Construct the evolutionCmp indicator
    if (props.evolution === 0) {
      evolutionCmp = (
        <Tooltip title="Identique sur la période précédente">
          <PauseOutlined rotate={90} />
        </Tooltip>
      );
    } else if (props.evolution > 0) {
      evolutionCmp = (
        <Tooltip title={`+${props.evolution} par rapport à la période précédente`}>
          <span className="text-success">
            <CaretUpOutlined />
            <span>+{props.evolution}</span>
          </span>
        </Tooltip>
      );
    } else {
      evolutionCmp = (
        <Tooltip title={`${props.evolution} par rapport à la période précédente`}>
          <span className="text-warning">
            <CaretDownOutlined />
            <span>{props.evolution}</span>
          </span>
        </Tooltip>
      );
    }
  }

  return evolutionCmp;
}

/**
 * Renders a statistic component.
 *
 * @param {Object} props - The properties for the Statistic component.
 * @param {string} props.title - The title of the statistic.
 * @param {number} props.value - The value of the statistic.
 * @param {number} [props.precision=0] - The decimal precision of the value.
 * @param {number} [props.evolution] - The evolution value compared to the previous period.
 * @param {string} [props.prefix] - The prefix to be displayed before the value.
 * @param {boolean} [props.isFetching] - Indicates if the statistic is being fetched.
 * @returns {ReactElement} The Statistic component.
 */
export default function Statistic({
  title,
  value,
  precision = 0,
  evolution,
  prefix,
  isFetching,
}: IStatisticProps): ReactElement {
  if (isFetching) {
    return (
      <Skeleton
        className="m-0"
        active
        paragraph={{
          rows: 1,
          width: "100%",
          className: "mb-05",
        }}
      />
    );
  }

  return (
    <AntStatistic
      title={title}
      value={value}
      precision={precision}
      formatter={formatter}
      prefix={prefix}
      suffix={
        <div className="ml-3 fs-09">
          <EvolutionComponent evolution={evolution} />
        </div>
      }
      loading={isFetching}
      className="appear"
    />
  );
}
