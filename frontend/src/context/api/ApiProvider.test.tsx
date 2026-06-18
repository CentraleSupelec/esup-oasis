/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { render, renderHook } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestQueryClient } from "@/test";
import { ApiProvider, useApi } from "./ApiProvider";

vi.mock("@context/api/ApiContextFn/UseGetItem", () => ({
  useGetItem: vi.fn(() => ({ data: undefined, isLoading: false })),
}));
vi.mock("@context/api/ApiContextFn/UseGetCollection", () => ({
  useGetCollection: vi.fn(() => ({ data: undefined, isLoading: false })),
}));
vi.mock("@context/api/ApiContextFn/UseGetFullCollection", () => ({
  useGetFullCollection: vi.fn(() => ({ data: undefined, isLoading: false })),
}));
vi.mock("@context/api/ApiContextFn/UsePatch", () => ({
  usePatch: vi.fn(() => ({ mutate: vi.fn(), status: "idle" })),
}));
vi.mock("@context/api/ApiContextFn/UsePut", () => ({
  usePut: vi.fn(() => ({ mutate: vi.fn(), status: "idle" })),
}));
vi.mock("@context/api/ApiContextFn/UsePost", () => ({
  usePost: vi.fn(() => ({ mutate: vi.fn(), status: "idle" })),
}));
vi.mock("@context/api/ApiContextFn/UseDelete", () => ({
  useDelete: vi.fn(() => ({ mutate: vi.fn(), status: "idle" })),
}));
vi.mock("@context/api/ApiContextFn/HandleInvalidation", () => ({
  handleInvalidation: vi.fn(),
}));

import { useGetItem as innerUseGetItem } from "@context/api/ApiContextFn/UseGetItem";
import { useGetCollection as innerUseGetCollection } from "@context/api/ApiContextFn/UseGetCollection";
import { usePost as innerUsePost } from "@context/api/ApiContextFn/UsePost";
import { handleInvalidation } from "@context/api/ApiContextFn/HandleInvalidation";
import { NB_MAX_ITEMS_PER_PAGE } from "@/constants";

describe("ApiProvider", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = createTestQueryClient();
    vi.clearAllMocks();
  });

  it("useApi() hors contexte lève une erreur explicite", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useApi())).toThrow(
      "useApi doit être utilisé dans un <ApiProvider>",
    );
    spy.mockRestore();
  });

  describe("impersonate", () => {
    function Consumer() {
      const api = useApi();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.useGetItem({ path: "/test" as any });
      return null;
    }

    it("ajoute X-Switch-User quand auth.impersonate est défini", () => {
      render(
        <ApiProvider
          baseUrl="https://api.test"
          auth={{ impersonate: "impersonate@test.fr" } as never}
          client={client}
        >
          <Consumer />
        </ApiProvider>,
      );
      expect(vi.mocked(innerUseGetItem)).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Switch-User": "impersonate@test.fr" }),
        }),
        expect.anything(),
      );
    });

    it("n'ajoute pas X-Switch-User sans impersonate", () => {
      render(
        <ApiProvider baseUrl="https://api.test" client={client}>
          <Consumer />
        </ApiProvider>,
      );
      const fetchOptions = vi.mocked(innerUseGetItem).mock.calls[0][1] as RequestInit & {
        headers: Record<string, string>;
      };
      expect(fetchOptions.headers).not.toHaveProperty("X-Switch-User");
    });

    it("propage X-Switch-User aux mutations (et pas seulement aux GET)", () => {
      function PostConsumer() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useApi().usePost({ path: "/evenements" as any });
        return null;
      }
      render(
        <ApiProvider
          baseUrl="https://api.test"
          auth={{ impersonate: "switch@test.fr" } as never}
          client={client}
        >
          <PostConsumer />
        </ApiProvider>,
      );
      const fetchOptions = vi.mocked(innerUsePost).mock.calls[0][1] as RequestInit & {
        headers: Record<string, string>;
      };
      expect(fetchOptions.headers["X-Switch-User"]).toBe("switch@test.fr");
    });
  });

  describe("câblage des fetchOptions et délégation", () => {
    function GetConsumer() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useApi().useGetItem({ path: "/evenements/1" as any });
      return null;
    }

    function renderProvider(ui: React.ReactNode) {
      return render(
        <ApiProvider baseUrl="https://api.test" client={client}>
          {ui}
        </ApiProvider>,
      );
    }

    it("transmet baseUrl et des fetchOptions sécurisés (credentials + en-têtes) à chaque hook", () => {
      renderProvider(<GetConsumer />);
      const [baseUrl, fetchOptions] = vi.mocked(innerUseGetItem).mock.calls[0];
      expect(baseUrl).toBe("https://api.test");
      expect(fetchOptions).toMatchObject({ credentials: "include" });
      expect((fetchOptions as RequestInit & { headers: Record<string, string> }).headers).toEqual(
        expect.objectContaining({ Accept: expect.any(String), "Content-Type": expect.any(String) }),
      );
    });

    it("injecte le QueryClient dans les mutations", () => {
      function PostConsumer() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useApi().usePost({ path: "/evenements" as any });
        return null;
      }
      renderProvider(<PostConsumer />);
      expect(vi.mocked(innerUsePost).mock.calls[0][2]).toBe(client);
    });

    it("useGetCollectionPaginated applique itemsPerPage par défaut (NB_MAX_ITEMS_PER_PAGE)", () => {
      function PaginatedConsumer() {
        // page/itemsPerPage omis volontairement pour tester le défaut appliqué par le provider.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useApi().useGetCollectionPaginated({ path: "/evenements" } as any);
        return null;
      }
      renderProvider(<PaginatedConsumer />);
      const options = vi.mocked(innerUseGetCollection).mock.calls[0][2] as unknown as {
        query: { itemsPerPage: number };
      };
      expect(options.query.itemsPerPage).toBe(NB_MAX_ITEMS_PER_PAGE);
    });

    it("useInvalidation délègue à handleInvalidation avec le client", () => {
      function InvalidationConsumer() {
        const api = useApi();
        api.useInvalidation(["/evenements"]);
        return null;
      }
      renderProvider(<InvalidationConsumer />);
      expect(handleInvalidation).toHaveBeenCalledWith(client, ["/evenements"], undefined);
    });
  });
});
