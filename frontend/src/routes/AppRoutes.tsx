/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ComponentType } from "react";
import { RoleValues } from "@lib";
import { COMMUN_ROUTES } from "@routes/features/communRoutes";
import { ADMIN_ROUTES } from "@routes/features/adminRoutes";
import { GESTIONNAIRE_ROUTES } from "@routes/features/gestionnaireRoutes";
import { PLANNING_ROUTES } from "@routes/features/planningRoutes";
import { INTERVENANT_ROUTES } from "@routes/features/intervenantRoutes";
import { BENEFICIAIRE_ROUTES } from "@routes/features/beneficiaireRoutes";
import { DEMANDEUR_ROUTES } from "@routes/features/demandeurRoutes";

export interface IRoute {
  path: string;
  element: ComponentType;
  roles: RoleValues[] | null;
}

export const APP_ROUTES: IRoute[] = [
  ...COMMUN_ROUTES,
  ...ADMIN_ROUTES,
  ...GESTIONNAIRE_ROUTES,
  ...PLANNING_ROUTES,
  ...INTERVENANT_ROUTES,
  ...BENEFICIAIRE_ROUTES,
  ...DEMANDEUR_ROUTES,
];
