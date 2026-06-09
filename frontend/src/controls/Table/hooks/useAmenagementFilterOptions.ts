/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { useAuth } from "@/auth/AuthProvider";
import {
  PREFETCH_CATEGORIES_AMENAGEMENTS,
  PREFETCH_COMPOSANTES,
  PREFETCH_FORMATIONS,
  PREFETCH_TAGS,
  PREFETCH_TYPES_AMENAGEMENTS,
  PREFETCH_TYPES_SUIVI_AMENAGEMENTS,
} from "@api";
import { FiltreAmenagement } from "@controls/Table/AmenagementTableLayout";

/**
 * Hook custom pour gérer les données et la logique du filtre d'aménagements
 */
export function useAmenagementFilterOptions(filtreAmenagement: FiltreAmenagement) {
  const user = useAuth().user;
  const api = useApi();

  // Récupération des catégories d'aménagements filtrées par domaine
  const { data: categoriesAmenagements } = api.useGetFullCollection({
    ...PREFETCH_CATEGORIES_AMENAGEMENTS,
    query: {
      "order[libelle]": "asc",
      // seulement ceux correspondant au domaine sélectionné
      "typesAmenagement.examens": filtreAmenagement.domaine === "examen" ? true : undefined,
      "typesAmenagement.aideHumaine":
        filtreAmenagement.domaine === "aideHumaine" ? true : undefined,
      "typesAmenagement.pedagogique":
        filtreAmenagement.domaine === "pedagogique" ? true : undefined,
    },
  });

  // Récupération des types d'aménagements filtrés par domaine
  const { data: typesAmenagements } = api.useGetFullCollection({
    ...PREFETCH_TYPES_AMENAGEMENTS,
    query: {
      "order[libelle]": "asc",
      // seulement ceux correspondant au domaine sélectionné
      examens: filtreAmenagement.domaine === "examen" ? true : undefined,
      aideHumaine: filtreAmenagement.domaine === "aideHumaine" ? true : undefined,
      pedagogique: filtreAmenagement.domaine === "pedagogique" ? true : undefined,
    },
  });

  // Récupération des données de référence
  const { data: suivis } = api.useGetFullCollection(PREFETCH_TYPES_SUIVI_AMENAGEMENTS);
  const { data: composantes } = api.useGetFullCollection(PREFETCH_COMPOSANTES);
  const { data: formations } = api.useGetFullCollection(PREFETCH_FORMATIONS);
  const { data: tags } = api.useGetFullCollection(PREFETCH_TAGS);

  // Récupération de la liste des gestionnaires (hors renforts)
  const { data: gestionnaires, isFetching: isFetchingGestionnaires } = api.useGetFullCollection({
    path: "/roles/{roleId}/utilisateurs",
    parameters: { roleId: "/roles/ROLE_GESTIONNAIRE" },
    query: { "order[nom]": "asc" },
    enabled: user?.isPlanificateur || user?.isRenfort,
  });

  // Helpers pour les profils utilisateur
  const estRenfort = !!(user && user.isRenfort && !user.isGestionnaire);
  const estReferent = !!(user && user.isReferentComposante && !user.isGestionnaire);

  return {
    categoriesAmenagements,
    typesAmenagements,
    suivis,
    composantes,
    formations,
    tags,
    gestionnaires,
    isFetchingGestionnaires,
    estRenfort,
    estReferent,
    user,
  };
}
