/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/**
 * Factories de handlers MSW réutilisables.
 *
 * Le serveur (`@/mocks/server`) démarre **sans handler par défaut** : chaque test
 * déclare explicitement ses réponses via `server.use(...)`, ce qui garde le contrôle
 * local et fait échouer (`onUnhandledRequest: "error"`) tout appel réseau non prévu.
 *
 * Ces factories mutualisent les patterns récurrents (collection Hydra, item, mutation,
 * erreur) pour éviter de réécrire les mêmes `http.get(...)` partout.
 */

import { http, HttpResponse, HttpHandler, JsonBodyType } from "msw";
import { hydraCollection, hydraPage } from "@/test/hydra";

/** GET d'une collection Hydra renvoyant toujours la même page (sans pagination). */
export function collectionHandler<T>(url: string, items: T[], total?: number): HttpHandler {
  return http.get(url, () => HttpResponse.json(hydraCollection(items, total ?? items.length)));
}

/**
 * GET d'une collection Hydra **paginée** : découpe `items` selon le `page` /
 * `itemsPerPage` de la requête.
 */
export function paginatedCollectionHandler<T>(
  url: string,
  items: T[],
  defaultItemsPerPage = 20,
): HttpHandler {
  return http.get(url, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const page = parseInt(params.get("page") ?? "1", 10);
    const itemsPerPage = parseInt(params.get("itemsPerPage") ?? String(defaultItemsPerPage), 10);
    return HttpResponse.json(hydraPage(items, page, itemsPerPage));
  });
}

/** GET d'un item unitaire. */
export function itemHandler(url: string, item: JsonBodyType): HttpHandler {
  return http.get(url, () => HttpResponse.json(item));
}

/** Handler de mutation (POST/PUT/PATCH/DELETE) renvoyant `responseBody` (par défaut l'écho du corps reçu). */
export function mutationHandler(
  method: "post" | "put" | "patch" | "delete",
  url: string,
  responseBody?: JsonBodyType,
  status = 200,
): HttpHandler {
  return http[method](url, async ({ request }) => {
    const body =
      responseBody ??
      (request.body ? ((await request.json().catch(() => ({}))) as JsonBodyType) : {});
    return HttpResponse.json(body, { status });
  });
}

/** Handler d'erreur HTTP au format Hydra (`hydra:description`). */
export function errorHandler(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  status = 500,
  description = "Erreur de test",
): HttpHandler {
  return http[method](url, () =>
    HttpResponse.json({ "hydra:description": description }, { status }),
  );
}
