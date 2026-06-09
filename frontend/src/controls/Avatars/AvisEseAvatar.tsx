/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { useApi } from "@context/api/ApiProvider";
import { isEnCoursSurPeriode } from "@utils/dates";
import { Avatar, Tooltip } from "antd";
import { CheckOutlined, HourglassOutlined, MinusOutlined } from "@ant-design/icons";
import { IAvisEse } from "@api";
import { env } from "@/env";

export function AvisEseAvatar(props: {
  avisId?: string;
  avis?: IAvisEse;
  size?: "small" | "default" | "large";
}) {
  const { data: avisData } = useApi().useGetItem({
    path: "/utilisateurs/{uid}/avis_ese/{id}",
    url: props.avisId as string,
    enabled: !!props.avisId,
  });
  const item = props.avis ?? avisData;

  if (!item) return null;

  const statut = isEnCoursSurPeriode(item.debut, item.fin) ? "en-cours" : "none";

  if (statut === "en-cours" && !item.fichier) {
    return (
      <Tooltip title={`Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"} en attente`}>
        <Avatar
          icon={<HourglassOutlined className="fs-08" aria-hidden />}
          className="bg-warning text-text"
          size={props.size || "default"}
        />
      </Tooltip>
    );
  }

  if (statut === "en-cours") {
    return (
      <Tooltip title={`Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"} en cours`}>
        <Avatar
          icon={<CheckOutlined className="fs-08" aria-hidden />}
          className="bg-success text-white"
          size={props.size || "default"}
        />
      </Tooltip>
    );
  }
  if (statut === "none") {
    return (
      <Tooltip title={`Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"} n'est pas en cours`}>
        <Avatar
          icon={<MinusOutlined className="fs-08" aria-hidden />}
          size={props.size || "default"}
          className="bg-warning text-white"
        />
      </Tooltip>
    );
  }

  return (
    <Avatar
      icon={<HourglassOutlined className="fs-08" aria-hidden />}
      size={props.size || "default"}
      className="bg-warning text-white"
    />
  );
}
