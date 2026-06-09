/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { CheckCircleFilled, WarningFilled } from "@ant-design/icons";
import { MenuProps } from "antd";

/**
 * Returns the appropriate libelle based on the given count (gestion pluriel).
 * @param {number | undefined} count - The count to determine the libelle.
 * @param {string} libelle0 - The libelle when count is undefined or 0.
 * @param {string} libelle1 - The libelle when count is 1.
 * @param {string} libelleN - The libelle when count is greater than 1, where "{count}" will be replaced with the actual count value.
 * @return {string} The appropriate libelle based on the count.
 */
export function getLibelleByCount(
  count: number | undefined,
  libelle0: string,
  libelle1: string,
  libelleN: string,
): string {
  if (count === undefined || count === 0) {
    return libelle0;
  }

  if (count === 1) {
    return libelle1;
  }

  return libelleN.replace("{count}", count.toString());
}

interface NotificationItemConfig {
  key: string;
  count: number | undefined;
  libelles: [string, string, string];
  onClick: () => void;
  severity?: "warning" | "error";
}

type MenuItem = NonNullable<MenuProps["items"]>[number];

/**
 * Creates a notification menu item.
 */
export function createNotificationItem({
  key,
  count,
  libelles,
  onClick,
  severity = "warning",
}: NotificationItemConfig): MenuItem {
  const isSuccess = !count || count === 0;
  return {
    key,
    className: isSuccess ? "text-success" : `text-${severity}`,
    icon: isSuccess ? (
      <CheckCircleFilled className="text-success" />
    ) : (
      <WarningFilled className={`text-${severity}`} />
    ),
    label: getLibelleByCount(count, libelles[0], libelles[1], libelles[2]),
    onClick,
  };
}
