/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

// --- INVALIDATION ---
import { QueryClient } from "@tanstack/react-query";

/** Invalide manuellement des entrées du cache React Query (usage hors mutation). Pour les mutations, préférer `invalidationQueryKeys` dans les options du hook. */
export type UseInvalidationHook = (queryKeys: string[], onSuccess?: VoidFunction) => void;

/**
 * Invalide les entrées du cache React Query dont la première clé commence par l'une des `queryKeys` fournies.
 *
 * @remarks Le matching est effectué par `String.startsWith` sur `queryKey[0]`.
 * Une clé `"/evenements"` invalide donc `/evenements`, `/evenements/42`, `/evenements?page=1`, etc.
 * Utiliser les constantes `QK_*` de `queryKeys.ts` pour éviter les chaînes littérales.
 */
export function handleInvalidation(
  client: QueryClient,
  queryKeys: string[],
  onSuccess?: VoidFunction,
) {
  client
    .invalidateQueries({
      predicate: (query) =>
        query.queryKey !== undefined &&
        query.queryKey["0"] !== undefined &&
        query.queryKey["0"] !== null &&
        queryKeys.some((qk) => {
          return (query.queryKey[0] as string).startsWith(qk);
        }),
    })
    .then(() => onSuccess && onSuccess());
}
