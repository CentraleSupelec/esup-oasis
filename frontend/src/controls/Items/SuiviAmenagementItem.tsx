/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { Tag } from "antd";
import { PREFETCH_TYPES_SUIVI_AMENAGEMENTS } from "@api";

interface ISuiviAmenagementItemProps {
  suiviId?: string;
  className?: string;
  couleur?: string;
}

/**
 * Renders a list of suivi items.
 *
 * @param {Object} props - The props for the SuiviItem component.
 *
 * @returns {ReactElement} - The rendered list of suivi items.
 */
export function SuiviAmenagementItem({
  suiviId,
  className,
  couleur,
}: ISuiviAmenagementItemProps): ReactElement {
  const { data: suivis, isFetching: isFetchingSuivis } = useApi().useGetFullCollection(
    PREFETCH_TYPES_SUIVI_AMENAGEMENTS,
  );

  if (isFetchingSuivis || !suivis) return <Spinner />;

  return (
    <Tag color={couleur} className={className}>
      {suivis?.items?.find((s) => s["@id"] === suiviId)?.libelle}
    </Tag>
  );
}
