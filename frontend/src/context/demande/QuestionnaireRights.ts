/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { RoleValues } from "@lib";
import { FONCTIONNALITES } from "@context/demande/QuestionnaireTypes";

export const MATRICE_DROITS_ROLES: {
  [role: string]: {
    [fonctionnalite: string]: boolean | ((rolesCommission: string[]) => boolean);
  };
} = {
  [RoleValues.ROLE_GESTIONNAIRE]: {
    [FONCTIONNALITES.DECLARER_RECEPTIONNEE]: true,
    [FONCTIONNALITES.ATTRIBUER_PROFIL]: true,
    [FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE]: true,
    [FONCTIONNALITES.STATUER_ACCOMPAGNEMENT]: true,
    [FONCTIONNALITES.MODIFIER_QUESTIONNAIRE]: true,
  },
  [RoleValues.ROLE_MEMBRE_COMMISSION]: {
    [FONCTIONNALITES.DECLARER_RECEPTIONNEE]: false,
    [FONCTIONNALITES.ATTRIBUER_PROFIL]: (roles) => roles.includes("ROLE_ATTRIBUER_PROFIL"),
    [FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE]: (roles) =>
      roles.includes("ROLE_VALIDER_CONFORMITE_DEMANDE"),
    [FONCTIONNALITES.STATUER_ACCOMPAGNEMENT]: false,
    [FONCTIONNALITES.MODIFIER_QUESTIONNAIRE]: false,
  },
  [RoleValues.ROLE_RENFORT]: {
    [FONCTIONNALITES.DECLARER_RECEPTIONNEE]: false,
    [FONCTIONNALITES.ATTRIBUER_PROFIL]: false,
    [FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE]: true,
    [FONCTIONNALITES.STATUER_ACCOMPAGNEMENT]: false,
    [FONCTIONNALITES.MODIFIER_QUESTIONNAIRE]: true,
  },
};
