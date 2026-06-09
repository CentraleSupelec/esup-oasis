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
import { useWait } from "@utils/Wait/useWait";
import { IStatistiquesEvenements } from "@api";

/**
 * Hook to retrieve the notification statistics for the current user.
 * Includes the fetching logic and polling (via useGetItem).
 */
export function useNotificationStats() {
  const auth = useAuth();
  const wait = useWait(2500);

  const { data: stats, isFetching: isFetchingStats } = useApi().useGetItem({
    path: "/statistiques",
    url: "/statistiques",
    query: {
      utilisateur: auth.user?.["@id"] as string,
    },
    // Les bénéficiaires n'ont pas accès aux stats
    // Bugfix lors de l'impersonate
    enabled:
      !wait &&
      !!auth.user?.["@id"] &&
      (auth.user?.isPlanificateur || auth.user?.isIntervenant) &&
      !auth.impersonate,
  });

  return {
    stats: stats as IStatistiquesEvenements | undefined,
    isFetchingStats,
  };
}
