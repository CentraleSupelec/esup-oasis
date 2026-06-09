/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { lazy } from "react";
import { IRoute } from "@routes/AppRoutes";
import { RoleValues } from "@lib";

export const GESTIONNAIRE_ROUTES: IRoute[] = [
  // --- Gestionnaire / Chargé d'accompagnement ---
  {
    path: "/interventions/renforts",
    element: lazy(
      () => import("@routes/gestionnaire/interventions/ValidationInterventionsRenforts"),
    ),
    roles: [RoleValues.ROLE_GESTIONNAIRE],
  },
  {
    path: "/bilans/intervenants",
    element: lazy(() => import("@routes/beneficiaire/BilanBeneficiaireIntervenant")),
    roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
  },
  {
    path: "/bilans/beneficiaires",
    element: lazy(() => import("@routes/beneficiaire/BilanBeneficiaireIntervenant")),
    roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
  },
  {
    path: "/beneficiaires/:id",
    element: lazy(() => import("@routes/gestionnaire/beneficiaires/Beneficiaire")),
    roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
  },
  {
    path: "/bilans",
    element: lazy(() => import("@routes/administration/Bilans/Bilans")),
    roles: [RoleValues.ROLE_GESTIONNAIRE],
  },
  // --- Gestionnaire / Planificateur ---
  {
    path: "/demandes/:id",
    element: lazy(() => import("@routes/gestionnaire/demandeurs/Demande")),
    roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
  },
  {
    path: "/demandeurs/:id",
    element: lazy(() => import("@routes/gestionnaire/demandeurs/Demandeur")),
    roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
  },
  {
    path: "/demandes/:id/saisie",
    element: lazy(() => import("@routes/gestionnaire/demandeurs/Demande")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/demandeurs",
    element: lazy(() => import("@routes/gestionnaire/demandeurs/Demandeurs")),
    roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
  },
  {
    path: "/beneficiaires",
    element: lazy(() => import("@routes/gestionnaire/beneficiaires/Beneficiaires")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/amenagements",
    element: lazy(() => import("@routes/gestionnaire/beneficiaires/Amenagements")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/intervenants",
    element: lazy(() => import("@routes/gestionnaire/intervenants/Intervenants")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/interventions/forfait",
    element: lazy(() => import("@routes/gestionnaire/interventions/InterventionsForfait")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/mes-interventions",
    element: lazy(() => import("@controls/Interventions/MesInterventions")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/dashboard",
    element: lazy(() => import("@routes/gestionnaire/dashboard/GestionnaireDashboard")),
    roles: [RoleValues.ROLE_PLANIFICATEUR],
  },
  // --- Membres de commission ---
  {
    path: "/dashboard",
    element: lazy(() => import("@routes/gestionnaire/demandeurs/Demandeurs")),
    roles: [RoleValues.ROLE_MEMBRE_COMMISSION],
  },
  {
    path: "/demandes",
    element: lazy(() => import("@routes/gestionnaire/demandeurs/Demandeurs")),
    roles: [RoleValues.ROLE_MEMBRE_COMMISSION],
  },
  // --- Référents ---
  {
    path: "/amenagements",
    element: lazy(() => import("@routes/gestionnaire/beneficiaires/Amenagements")),
    roles: [RoleValues.ROLE_REFERENT_COMPOSANTE],
  },
  {
    path: "/dashboard",
    element: lazy(() => import("@routes/gestionnaire/beneficiaires/Amenagements")),
    roles: [RoleValues.ROLE_REFERENT_COMPOSANTE],
  },
];
