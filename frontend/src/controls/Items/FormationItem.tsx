/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Breakpoint, Tooltip } from "antd";
import Spinner from "@controls/Spinner/Spinner";
import { useApi } from "@context/api/ApiProvider";
import { IFormation, PREFETCH_FORMATIONS } from "@api";
import { EllipsisMiddle } from "@controls/Typography/EllipsisMiddle";

interface IItemFormation {
  formation?: IFormation;
  formationId?: string;
  showAvatar?: boolean;
  responsive?: Breakpoint;
  className?: string;
  styleLibelle?: React.CSSProperties;
}

/**
 * Renders a formation item component.
 *
 * @param {IItemFormation} props - The props for the formation item component.
 * @param {IFormation} [props.formation] - The formation data.
 * @param {string} [props.formationId] - The ID of the formation.
 *
 * @returns {ReactElement} The rendered formation item component.
 */
function FormationItem({ formation, formationId }: IItemFormation): ReactElement {
  const { data: dataFormation, isFetching } = useApi().useGetFullCollection(PREFETCH_FORMATIONS);
  const item = formation ?? dataFormation?.items.find((t) => t["@id"] === formationId);

  if (!item || isFetching) return <Spinner />;

  return (
    <Tooltip title={item?.libelle}>
      <EllipsisMiddle content={item?.libelle as string} suffixCount={12} expandable />
    </Tooltip>
  );
}

const FormationItemMemo = memo(
  FormationItem,
  (prev, next) =>
    prev.formationId === next.formationId && prev.formation?.["@id"] === next.formation?.["@id"],
);
export { FormationItemMemo as FormationItem };
