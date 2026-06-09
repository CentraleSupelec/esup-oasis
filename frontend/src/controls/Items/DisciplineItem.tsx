/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Breakpoint, Tag, Tooltip } from "antd";
import Spinner from "@controls/Spinner/Spinner";
import { useApi } from "@context/api/ApiProvider";
import { IDiscipline } from "@api";

interface IItemDiscipline {
  discipline?: IDiscipline;
  disciplineId?: string;
  showAvatar?: boolean;
  responsive?: Breakpoint;
  className?: string;
  styleLibelle?: React.CSSProperties;
}

/**
 * Renders a discipline item component.
 *
 * @param {IItemDiscipline} props - The props for the discipline item component.
 * @param {IDiscipline} [props.discipline] - The discipline data.
 * @param {string} [props.disciplineId] - The ID of the discipline.
 *
 * @returns {ReactElement} The rendered discipline item component.
 */
export function DisciplineItem({ discipline, disciplineId }: IItemDiscipline): ReactElement {
  const { data: dataDiscipline, isFetching } = useApi().useGetFullCollection({
    path: "/disciplines_sportives",
  });
  const item = discipline ?? dataDiscipline?.items.find((t) => t["@id"] === disciplineId);

  if (!item || isFetching) return <Spinner />;

  return (
    <Tooltip title={item?.libelle}>
      <Tag>{item?.libelle}</Tag>
    </Tooltip>
  );
}
