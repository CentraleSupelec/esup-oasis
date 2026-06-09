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
import { PREFETCH_COMPOSANTES, PREFETCH_FORMATIONS, PREFETCH_PROFILS, PREFETCH_TAGS } from "@api";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";

/**
 * Hook custom pour gérer les données et la logique du filtre de bénéficiaires
 */
export function useBeneficiaireFilterOptions(_filtreBeneficiaire: FiltreBeneficiaire) {
  const { user, impersonate } = useAuth();
  const api = useApi();

  const { data: profils } = api.useGetFullCollection({
    ...PREFETCH_PROFILS,
    enabled: user?.isGestionnaire,
  });

  const { data: stats } = api.useGetItem({
    path: "/statistiques",
    query: {
      utilisateur: user?.["@id"] as string,
    },
    enabled:
      // Les bénéficiaires n'ont pas accès aux stats
      // Bugfix lors de l'impersonate
      !!user?.["@id"] && (user?.isPlanificateur || user?.isIntervenant) && !impersonate,
  });

  const { data: composantes } = api.useGetFullCollection(PREFETCH_COMPOSANTES);
  const { data: formations } = api.useGetFullCollection(PREFETCH_FORMATIONS);
  const { data: tags } = api.useGetFullCollection(PREFETCH_TAGS);

  const { data: gestionnaires, isFetching: isFetchingGestionnaires } = api.useGetFullCollection({
    path: "/roles/{roleId}/utilisateurs",
    parameters: { roleId: "/roles/ROLE_GESTIONNAIRE" },
    query: { "order[nom]": "asc" },
    enabled: user?.isPlanificateur,
  });

  return {
    profils,
    stats,
    composantes,
    formations,
    tags,
    gestionnaires,
    isFetchingGestionnaires,
    user,
  };
}
