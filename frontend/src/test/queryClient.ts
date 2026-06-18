/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Crée un `QueryClient` dédié aux tests.
 *
 * Diffère du client de production (`@/queryClient`) sur deux points indispensables
 * en environnement de test :
 * - `retry: false` → un appel en erreur échoue immédiatement (pas d'attente des
 *   relances, tests déterministes et rapides) ;
 * - pas de `broadcastQueryClient` (le canal localStorage cross-onglets n'a pas de
 *   sens en test et pollue l'isolation entre fichiers).
 *
 * Chaque test doit utiliser sa **propre** instance pour garantir l'isolation du cache.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Évite les refetch parasites pendant l'exécution des tests.
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
