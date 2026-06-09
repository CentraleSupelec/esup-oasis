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

const PLANNING_ROLES = [
  RoleValues.ROLE_ADMIN,
  RoleValues.ROLE_PLANIFICATEUR,
  RoleValues.ROLE_BENEFICIAIRE,
  RoleValues.ROLE_INTERVENANT,
] as const;

export const PLANNING_ROUTES: IRoute[] = [
  {
    path: "/planning/calendrier",
    element: lazy(() => import("@controls/Calendar/PlanningCalendar")),
    roles: [...PLANNING_ROLES],
  },
  {
    path: "/planning/liste-evenements",
    element: lazy(() => import("@controls/Calendar/PlanningTable")),
    roles: [...PLANNING_ROLES],
  },
  {
    path: "/planning/evenements-sans-beneficiaires",
    element: lazy(() => import("@routes/gestionnaire/interventions/EvenementsSansBeneficiaires")),
    roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_PLANIFICATEUR],
  },
  {
    path: "/planning",
    element: lazy(() => import("@controls/Calendar/PlanningWithSider")),
    roles: [...PLANNING_ROLES],
  },
];
