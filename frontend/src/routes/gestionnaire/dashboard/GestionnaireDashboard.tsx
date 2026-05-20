/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect } from "react";
import { Layout, Typography } from "antd";
import "./Dashboard.scss";
import { useApi } from "../../../context/api/ApiProvider";
import DashboardUtilisateurStats from "../../../controls/Dashboard/DashboardUtilisateurStats";
import { useAuth } from "../../../auth/AuthProvider";
import { PREFETCH_LAST_PERIODES_RH } from "../../../api/ApiPrefetchHelpers";
import { IntervenantDashboardServicesFaits } from "../../../controls/Dashboard/IntervenantDashboardServicesFaits";
import AlertCompleterProfil from "../../../controls/Dashboard/AlertCompleterProfil";
import DashboardUtilisateurStatsRefresh from "../../../controls/Dashboard/DashboardUtilisateurStatsRefresh";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

/**
 * Renders the dashboard component for ROLE_GESTIONNAIRE.
 *
 * @returns {ReactElement} The rendered dashboard component.
 */
export function GestionnaireDashboard(): ReactElement {
   const user = useAuth().user;
   const screens = useBreakpoint();
   const apiPrefetch = useApi().usePrefetch;

   // Prefetching : last periodes RH
   useEffect(() => {
      apiPrefetch(PREFETCH_LAST_PERIODES_RH(user)).then();
   }, [user, apiPrefetch]);

   return (
      <Layout.Content style={{ padding: "0 50px" }}>
         <Typography.Title level={1}>
            Tableau de bord
            {screens.lg && (
               <DashboardUtilisateurStatsRefresh
                  utilisateurId={user?.["@id"] as string}
                  className="btn-label-hover"
                  wrapperClassName="float-right"
               />
            )}
         </Typography.Title>
         <AlertCompleterProfil />
         <DashboardUtilisateurStats utilisateurId={user?.["@id"] as string} />
         {(user?.isIntervenant || user?.isRenfort) && <IntervenantDashboardServicesFaits />}
         {!screens.lg && (
            <DashboardUtilisateurStatsRefresh
               utilisateurId={user?.["@id"] as string}
               wrapperClassName="mt-3 text-center"
            />
         )}
      </Layout.Content>
   );
}

export default GestionnaireDashboard;
