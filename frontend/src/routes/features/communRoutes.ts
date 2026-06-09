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

export const COMMUN_ROUTES: IRoute[] = [
  {
    path: "/rgpd",
    element: lazy(() => import("@routes/commun/Rgpd")),
    roles: null,
  },
  {
    path: "/credits",
    element: lazy(() => import("@routes/commun/MentionsLegales")),
    roles: null,
  },
  {
    path: "/versions",
    element: lazy(() => import("@routes/commun/Version")),
    roles: null,
  },
  {
    path: "/404",
    element: lazy(() => import("@routes/commun/NotFound")),
    roles: null,
  },
];
