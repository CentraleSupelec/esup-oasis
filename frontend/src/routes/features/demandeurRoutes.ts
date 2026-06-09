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

const DEMANDEUR_ROLES = [
  RoleValues.ROLE_DEMANDEUR,
  RoleValues.ROLE_BENEFICIAIRE,
  RoleValues.ROLE_INTERVENANT,
] as const;

export const DEMANDEUR_ROUTES: IRoute[] = [
  {
    path: "/demandes/:id/saisie",
    element: lazy(() => import("@routes/demandeur/DemandeSaisie")),
    roles: [...DEMANDEUR_ROLES],
  },
  {
    path: "/demandes/:id",
    element: lazy(() => import("@routes/demandeur/DemandeAvancement")),
    roles: [...DEMANDEUR_ROLES],
  },
  {
    path: "/demandes",
    element: lazy(() => import("@routes/demandeur/Demandes")),
    roles: [...DEMANDEUR_ROLES],
  },
  {
    path: "/dashboard",
    element: lazy(() => import("@routes/demandeur/Demandes")),
    roles: [RoleValues.ROLE_DEMANDEUR],
  },
];
