/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { isSameDay } from "@utils/dates";
import { CaretRightOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Tooltip } from "antd";

/**
 * Generates the week header element for a given date.
 *
 * @param {Date} date - The date for which the week header is generated.
 * @param {boolean} locked - Indicates whether the week is locked or not.
 *
 * @return {ReactElement} The week header element.
 */
export function getWeekHeader(date: Date, locked: boolean): ReactElement {
  return (
    <div className="week-header">
      {isSameDay(date, new Date()) ? (
        <CaretRightOutlined className="today-carret fs-09" />
      ) : undefined}
      <span className="jour">
        {dayjs(date).format("dddd")}
        <br />
      </span>

      <span className="date" aria-label={dayjs(date).format("D MMMM")}>
        {dayjs(date).format("D/MM")}
        {locked && (
          <Tooltip title="Journée verrouillée à la modification, contactez l'administrateur">
            <LockOutlined className="ml-1 text-warning" />
          </Tooltip>
        )}
      </span>
    </div>
  );
}

/**
 * Returns the month header element for a given date.
 * @param {Date} date - The date to display the month header for.
 * @return {ReactElement} - The React element representing the month header.
 */
export function getMonthHeader(date: Date): ReactElement {
  return (
    <div className="month-header">
      {isSameDay(date, new Date()) ? <CaretRightOutlined className="today-carret" /> : undefined}
      <span className="jour">
        {dayjs(date).format("dddd")}
        <br />
      </span>
    </div>
  );
}
