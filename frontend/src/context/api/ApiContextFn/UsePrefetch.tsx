/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

// --- PREFETCH ---
import { QueryClient } from "@tanstack/react-query";
import { PaginateResult, RequestMethod } from "@context/api/ApiProvider";
import { buildUrl } from "@context/api/ApiContextFn/UrlBuilder";
import { ApiPathMethodParameters, ApiPathMethodQuery, ApiPathMethodResponse, Path } from "@api";

/**
 * Précharge une collection dans le cache React Query sans déclencher de rendu.
 * À appeler dans un `useEffect` ou un gestionnaire d'événement pour anticiper la navigation.
 * Les constantes `PREFETCH_*` de `ApiPrefetchHelpers.ts` fournissent les options préconfigurées pour les référentiels communs.
 *
 * @param options.path - Endpoint de collection API.
 * @param options.query - Paramètres de filtrage/pagination (même format que `useGetCollection`).
 * @param options.parameters - Paramètres de chemin si `path` contient des segments dynamiques.
 */
export type UsePrefetchHook = <P extends Path>(options: {
  path: P;
  query?: ApiPathMethodQuery<P, "get">;
  parameters?: ApiPathMethodParameters<P, "get">;
}) => Promise<void>;

export async function usePrefetch<P extends Path>(
  baseUrl: string,
  fetchOptions: RequestInit,
  client: QueryClient,
  options: {
    path: P;
    query?: ApiPathMethodQuery<P, "get">;
    parameters?: ApiPathMethodParameters<P, "get">;
  },
): Promise<void> {
  const url = buildUrl<P, "get">(
    baseUrl,
    options.path,
    undefined,
    options.parameters,
    options.query,
  );

  await client.prefetchQuery({
    queryKey: [options.path, url],
    queryFn: async () => {
      const response = await fetch(url, {
        method: RequestMethod.GET,
        ...fetchOptions,
      });

      if (response.status >= 400) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        items: data["hydra:member"],
        totalItems: data["hydra:totalItems"],
        currentPage:
          options.query && typeof options.query === "object" && "page" in options.query
            ? options.query.page
            : undefined,
        itemsPerPage:
          options.query && typeof options.query === "object" && "itemsPerPage" in options.query
            ? options.query.itemsPerPage
            : undefined,
      } as PaginateResult<ApiPathMethodResponse<P, "get">>;
    },
  });
}
