/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { QueryClient } from "@tanstack/react-query";
import { handleInvalidation } from "./HandleInvalidation";

const makeQuery = (key: unknown) => ({ queryKey: key }) as never;

const makeClient = () => {
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  const client = { invalidateQueries } as unknown as QueryClient;
  return { client, invalidateQueries };
};

const getPredicate = (invalidateQueries: ReturnType<typeof vi.fn>) =>
  invalidateQueries.mock.calls[0][0].predicate as (query: never) => boolean;

// ---------------------------------------------------------------------------
// handleInvalidation — appel à invalidateQueries
// ---------------------------------------------------------------------------

describe("handleInvalidation — appel à invalidateQueries", () => {
  it("appelle invalidateQueries une fois sur le client", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });

  it("appelle onSuccess après résolution de l'invalidation", async () => {
    const { client } = makeClient();
    const onSuccess = vi.fn();
    handleInvalidation(client, ["/evenements"], onSuccess);
    await Promise.resolve();
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// handleInvalidation — prédicat : correspondance startsWith
// ---------------------------------------------------------------------------

describe("handleInvalidation — prédicat : correspondance startsWith", () => {
  it("retourne true pour une clé identique à la queryKey", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery(["/evenements"]))).toBe(true);
  });

  it("retourne true pour une sous-ressource (startsWith)", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery(["/evenements/42"]))).toBe(true);
  });

  it("retourne true pour une clé avec query string (startsWith)", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery(["/evenements?page=1"]))).toBe(true);
  });

  it("retourne false pour une clé qui ne correspond pas", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery(["/utilisateurs"]))).toBe(false);
  });

  it("retourne true si l'une des queryKeys correspond parmi plusieurs", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements", "/utilisateurs"]);
    expect(getPredicate(invalidateQueries)(makeQuery(["/utilisateurs/123"]))).toBe(true);
  });

  it("retourne false si aucune queryKey ne correspond parmi plusieurs", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements", "/utilisateurs"]);
    expect(getPredicate(invalidateQueries)(makeQuery(["/intervenants"]))).toBe(false);
  });

  it("retourne false pour un tableau de queryKeys vide", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, []);
    expect(getPredicate(invalidateQueries)(makeQuery(["/evenements"]))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleInvalidation — prédicat : cas limites sur queryKey
// ---------------------------------------------------------------------------

describe("handleInvalidation — prédicat : cas limites sur queryKey", () => {
  it("retourne false si queryKey[0] est undefined", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery([undefined]))).toBe(false);
  });

  it("retourne false si queryKey[0] est null", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery([null]))).toBe(false);
  });

  it("retourne false si queryKey est undefined", () => {
    const { client, invalidateQueries } = makeClient();
    handleInvalidation(client, ["/evenements"]);
    expect(getPredicate(invalidateQueries)(makeQuery(undefined))).toBe(false);
  });
});
