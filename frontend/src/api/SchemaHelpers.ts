/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { components, paths } from "@api/schema";

/**
 * Helpers pour utiliser les types générés de l'API
 */

export type Paths = paths;
export type Components = components;

type DefaultToGet<T extends string | undefined> = T extends string ? T : "get";
type DefaultCodeToSuccess<M extends string | undefined = undefined> = "delete" extends M
  ? 204
  : "post" extends M
    ? 201
    : "put" extends M
      ? 200
      : "patch" extends M
        ? 200
        : "get" extends M
          ? 200
          : 200;

/** Union de tous les chemins d'endpoints définis dans le schéma OpenAPI. */
export type Path = keyof Paths;
export type Method = "get" | "post" | "delete" | "patch";

export type ContentType = "application/ld+json";
export const ApiContentType: ContentType = "application/ld+json";
export type ContentTypePatch = "application/merge-patch+json";
export type ContentTypePostFile = "multipart/form-data";
export const ApiContentTypePatch: ContentTypePatch = "application/merge-patch+json";

/**
 * Methods
 */

type ApiPathMethod<P extends Path, M extends string | undefined> =
  DefaultToGet<M> extends keyof Paths[P] ? Paths[P][DefaultToGet<M>] : never;

/**
 * Responses
 */

type ApiPathMethodResponses<
  P extends Path,
  M extends string | undefined = undefined,
> = "responses" extends keyof ApiPathMethod<P, M> ? ApiPathMethod<P, M>["responses"] : never;

type WApiPathMethodResponse<P extends Path, M extends string | undefined = undefined> =
  DefaultCodeToSuccess<M> extends keyof ApiPathMethodResponses<P, M>
    ? ApiPathMethodResponses<P, M>[DefaultCodeToSuccess<M>]
    : never;

type ApiPathMethodResponseContent<
  P extends Path,
  M extends string | undefined = undefined,
> = "content" extends keyof WApiPathMethodResponse<P, M>
  ? WApiPathMethodResponse<P, M>["content"]
  : never;

/**
 * Type de la réponse succès d'un endpoint API Platform.
 * Par défaut `M = "get"` (200). Pour POST utiliser `"post"` (201), pour DELETE `"delete"` (204 → `undefined`).
 * @example `ApiPathMethodResponse<"/evenements/{id}", "get">` → type de l'événement retourné
 */
export type ApiPathMethodResponse<
  P extends Path,
  M extends string | undefined = undefined,
> = ContentType extends keyof ApiPathMethodResponseContent<P, M>
  ? ApiPathMethodResponseContent<P, M>[ContentType]
  : never;

/**
 * Parameters
 */

type WApiPathMethodParameters<
  P extends Path,
  M extends string | undefined = undefined,
> = "parameters" extends keyof ApiPathMethod<P, M> ? ApiPathMethod<P, M>["parameters"] : never;

/** Paramètres de chemin d'un endpoint (ex. `{ id: number }` pour `"/evenements/{id}"`). */
export type ApiPathMethodParameters<
  P extends Path,
  M extends string | undefined = undefined,
> = "path" extends keyof WApiPathMethodParameters<P, M>
  ? WApiPathMethodParameters<P, M>["path"]
  : never;

/**
 * Request body
 */

type WApiPathMethodRequestBody<
  P extends Path,
  M extends string | undefined = undefined,
> = "requestBody" extends keyof ApiPathMethod<P, M> ? ApiPathMethod<P, M>["requestBody"] : never;

type WApiPathMethodRequestBodyContent<
  P extends Path,
  M extends string | undefined = undefined,
> = "content" extends keyof WApiPathMethodRequestBody<P, M>
  ? WApiPathMethodRequestBody<P, M>["content"]
  : never;

export type ApiPathMethodRequestBody<
  P extends Path,
  M extends string | undefined = undefined,
  C extends ContentType | ContentTypePatch | ContentTypePostFile = ContentType,
> = C extends keyof WApiPathMethodRequestBodyContent<P, M>
  ? WApiPathMethodRequestBodyContent<P, M>[C]
  : never;

/**
 * Query
 */

/** Paramètres de requête (query string) d'un endpoint (ex. `{ page?: number, itemsPerPage?: number, "order[libelle]"?: "asc"|"desc" }`). */
export type ApiPathMethodQuery<
  P extends Path,
  M extends string | undefined = undefined,
> = "query" extends keyof WApiPathMethodParameters<P, M>
  ? WApiPathMethodParameters<P, M>["query"]
  : never;

/** Union de tous les paths GET dont la query supporte la pagination (`page` et `itemsPerPage`). */
export type PaginatedPath = {
  [P in Path]: "page" extends keyof NonNullable<ApiPathMethodQuery<P, "get">>
    ? "itemsPerPage" extends keyof NonNullable<ApiPathMethodQuery<P, "get">>
      ? P
      : never
    : never;
}[Path];
