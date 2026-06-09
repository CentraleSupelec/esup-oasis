/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Button } from "antd";
import "@routes/gestionnaire/dashboard/Dashboard.scss";
import { useApi } from "@context/api/ApiProvider";
import { ReloadOutlined } from "@ant-design/icons";

interface IDashboardUtilisateurProps {
  utilisateurId: string;
  className?: string;
  wrapperClassName?: string;
}

/**
 * Render a user dashboard
 * @param {object} props - The props object
 * @param {number} props.utilisateurId - The user ID
 * @returns {ReactElement} - The rendered dashboard component
 */
export default function DashboardUtilisateurStatsRefresh({
  utilisateurId,
  className,
  wrapperClassName,
}: IDashboardUtilisateurProps): ReactElement {
  const { refetch } = useApi().useGetItem({
    path: "/statistiques",
    url: "/statistiques",
    query: {
      utilisateur: utilisateurId,
    },
    enabled: !!utilisateurId,
  });

  return (
    <div className={wrapperClassName}>
      <Button
        size="small"
        className={className}
        type="link"
        icon={<ReloadOutlined />}
        onClick={() => refetch()}
      >
        Actualiser
      </Button>
    </div>
  );
}
