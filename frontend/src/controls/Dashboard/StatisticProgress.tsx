/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect } from "react";
import { Col, Progress, Row, Skeleton, Tooltip, Typography } from "antd";
import { pluriel } from "@utils/string";
import { EvolutionComponent } from "@controls/Dashboard/Statistic";

interface IStatisticProgressProps {
  title: string;
  done: number;
  total: number;
  precision?: number;
  evolution?: number;
  prefix?: React.ReactNode;
  isFetching?: boolean;
}

/**
 * Renders a statistic component.
 *
 * @param {Object} props - The properties for the Statistic component.
 * @param {string} props.title - The title of the statistic.
 * @param {number} [props.evolution] - The evolution value compared to the previous period.
 * @param {boolean} [props.isFetching] - Indicates if the statistic is being fetched.
 * @returns {ReactElement} The Statistic component.
 */
export default function StatisticProgress({
  title,
  done,
  total,
  evolution,
  isFetching,
}: IStatisticProgressProps): ReactElement {
  const [value, setValue] = React.useState<number>(0);

  function getStatus() {
    if (total === 0) {
      return "success";
    }
    if (done === total) {
      return "success";
    }

    return "exception";
  }

  function getTooltip() {
    if (total === 0) {
      return "Aucun évènement à traiter";
    }
    if (done === total) {
      return "Tous les évènements ont été affects";
    }

    return (
      <>
        {done} {} {pluriel(done, "évènement", "évènements")} {pluriel(done, "affecté", "affectés")}{" "}
        sur {total} {pluriel(total, "évènement", "évènements")}
      </>
    );
  }

  function getClassName() {
    if (total === 0) {
      return "text-success";
    }
    if (done === total) {
      return "text-success";
    }

    return "text-danger";
  }

  useEffect(() => {
    if (!isFetching) {
      window.setTimeout(() => {
        setValue(total === 0 ? 100 : (done / total) * 100);
      }, 350);
    }
  }, [total, done, isFetching]);

  return (
    <>
      <Typography.Text type="secondary">
        {title}
        <div className="float-right">
          <EvolutionComponent evolution={evolution} />
        </div>
      </Typography.Text>
      <Tooltip placement="bottom" title={getTooltip()}>
        <Row className="mt-2">
          {isFetching ? (
            <Col span={24}>
              <Skeleton.Input active size="small" block className="mb-0 mt-0" />
            </Col>
          ) : (
            <>
              <Col span={21}>
                <Progress
                  gapPlacement="bottom"
                  className="w-100"
                  percent={value}
                  status={getStatus()}
                  size={{ height: 16 }}
                />
              </Col>
              <Col span={3} className={`text-right fs-08 ${getClassName()}`}>
                {done}/{total}
              </Col>
            </>
          )}
        </Row>
      </Tooltip>
    </>
  );
}
