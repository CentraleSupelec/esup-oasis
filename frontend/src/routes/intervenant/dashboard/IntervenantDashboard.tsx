/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Layout, Typography } from "antd";
import "@routes/intervenant/dashboard/Dashboard.scss";
import DashboardUtilisateurStats from "@controls/Dashboard/DashboardUtilisateurStats";
import { useAuth } from "@/auth/AuthProvider";
import { IntervenantDashboardServicesFaits } from "@controls/Dashboard/IntervenantDashboardServicesFaits";
import AlertCompleterProfil from "@controls/Dashboard/AlertCompleterProfil";

/**
 * Represents the dashboard component for the intervenant.
 * @returns {ReactElement} The rendered dashboard component.
 */
export function IntervenantDashboard(): ReactElement {
  const user = useAuth().user;

  return (
    <Layout.Content style={{ padding: "0 50px" }}>
      <Typography.Title level={1}>Tableau de bord</Typography.Title>
      <AlertCompleterProfil />

      {user?.isIntervenantOuRenfort && (
        <DashboardUtilisateurStats utilisateurId={user?.["@id"] as string} />
      )}

      <IntervenantDashboardServicesFaits />
    </Layout.Content>
  );
}

export default IntervenantDashboard;
