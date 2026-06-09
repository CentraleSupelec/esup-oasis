/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Avatar } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { ICampus, PREFETCH_CAMPUS } from "@api";

interface IAvatarCampus {
  campus?: ICampus;
  campusId?: string;
}

export const CampusAvatar: React.FC<IAvatarCampus> = memo(
  ({ campus, campusId }: IAvatarCampus): ReactElement => {
    const { data: dataCampus, isFetching } = useApi().useGetFullCollection(PREFETCH_CAMPUS);

    const campusData = campus ?? dataCampus?.items.find((t) => t["@id"] === campusId);

    if (isFetching || campusData === undefined) {
      return <Avatar className="bg-primary" icon={<BankOutlined />} />;
    }

    return (
      <Avatar data-testid={campusData.libelle} className="bg-primary" aria-hidden>
        {campusData.libelle[0].toUpperCase()}
      </Avatar>
    );
  },
  (prevProps, nextProps) =>
    prevProps.campusId === nextProps.campusId &&
    JSON.stringify(prevProps.campus) === JSON.stringify(nextProps.campus),
);
