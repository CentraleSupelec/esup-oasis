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

export const BENEFICIAIRE_ROUTES: IRoute[] = [
  {
    path: "/dashboard",
    element: lazy(() => import("@routes/beneficiaire/BeneficiaireDashboard")),
    roles: [RoleValues.ROLE_BENEFICIAIRE],
  },
];
