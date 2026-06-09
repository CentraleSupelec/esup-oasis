/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import Spinner from "@controls/Spinner/Spinner";
import { useApi } from "@context/api/ApiProvider";
import { Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { MinusOutlined, SendOutlined } from "@ant-design/icons";
import { IPeriode } from "@api";

interface IItemPeriode {
  periode?: IPeriode;
  periodeId?: string;
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Renders an item for a period with optional icon and tooltip.
 *
 * @param {IItemPeriode} IItemPeriode - The item for a period.
 * @param {IPeriode} [IItemPeriode.periode] - The period object.
 * @param {string} [IItemPeriode.periodeId] - The period ID.
 * @param {boolean} [IItemPeriode.showIcon=true] - Whether to show the icon or not (default is true).
 * @param {boolean} [IItemPeriode.showTooltip=true] - Whether to show the tooltip or not (default is true).
 * @param {string} [IItemPeriode.className] - The class name for the item.
 * @returns {ReactElement} The rendered period item.
 */
export function PeriodeRhItem({
  periode,
  periodeId,
  showIcon = true,
  showTooltip = true,
  className,
}: IItemPeriode): ReactElement {
  const { data: periodeData } = useApi().useGetFullCollection({
    path: "/periodes",
  });
  const item = periode ?? periodeData?.items.find((x) => x["@id"] === periodeId);
  if (!item) return <Spinner />;

  function getIcon() {
    if (!showIcon) return null;
    return item?.dateEnvoi ? <SendOutlined /> : <MinusOutlined />;
  }

  return (
    <Tooltip
      title={showTooltip ? `Période ${item.dateEnvoi ? "envoyée" : "non envoyée"}` : undefined}
    >
      <Tag icon={getIcon()} className={className}>
        {dayjs(item.debut).format("DD/MM/YYYY")} au {dayjs(item.fin).format("DD/MM/YYYY")}
      </Tag>
    </Tooltip>
  );
}
