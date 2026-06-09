import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { server } from "@/mocks/server";
import { ApiProvider } from "@context/api/ApiProvider";
import { QuestionnaireProvider, useQuestionnaire, FONCTIONNALITES } from "./QuestionnaireProvider";

vi.mock("@/env", () => ({
  env: {
    REACT_APP_API: "http://api.test",
    REACT_APP_API_PREFIX: "",
    REACT_APP_ENVIRONMENT: "test",
  },
}));

vi.mock("@/queryClient", () => ({
  queryClient: { clear: vi.fn(), invalidateQueries: vi.fn() },
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

let mockUser: { uid: string; roles: string[] } | null = {
  uid: "g@test.fr",
  roles: ["ROLE_GESTIONNAIRE"],
};

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser, signOut: vi.fn() }),
}));

const BASE_URL = "http://api.test";

function makeWrapper(providerProps: { demandeId?: string; typeDemandeId?: string }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ApiProvider baseUrl={BASE_URL} client={client}>
            <QuestionnaireProvider {...providerProps}>{children}</QuestionnaireProvider>
          </ApiProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

const demande = {
  "@id": "/demandes/1",
  typeDemande: "/types_demandes/5",
  campagne: "/types_demandes/5/campagnes/9",
  etat: "EN_COURS",
  complete: false,
  etapes: [],
};

const typeDemande = {
  "@id": "/types_demandes/5",
  libelle: "Aménagement d'études",
  etapes: [],
};

const campagne = {
  "@id": "/types_demandes/5/campagnes/9",
  libelle: "Campagne 2026",
};

describe("QuestionnaireProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { uid: "g@test.fr", roles: ["ROLE_GESTIONNAIRE"] };
  });

  it("cascade demande → typeDemande → campagne (dépendances en série)", async () => {
    const requested: string[] = [];

    server.use(
      http.get(`${BASE_URL}/demandes/1`, async () => {
        requested.push("/demandes/1");
        // Délai : si typeDemande/campagne n'étaient pas gated sur la
        // résolution de la demande, leurs requêtes partiraient pendant ce délai.
        await new Promise((r) => setTimeout(r, 30));
        return HttpResponse.json(demande);
      }),
      http.get(`${BASE_URL}/types_demandes/5`, () => {
        requested.push("/types_demandes/5");
        return HttpResponse.json(typeDemande);
      }),
      http.get(`${BASE_URL}/types_demandes/5/campagnes/9`, () => {
        requested.push("/campagne");
        return HttpResponse.json(campagne);
      }),
    );

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: makeWrapper({ demandeId: "/demandes/1" }),
    });

    await waitFor(() => expect(result.current.campagne).toBeDefined(), {
      timeout: 3000,
    });

    expect(result.current.demande?.["@id"]).toBe("/demandes/1");
    expect(result.current.typeDemande?.["@id"]).toBe("/types_demandes/5");
    expect(result.current.campagne?.["@id"]).toBe("/types_demandes/5/campagnes/9");
    // questionnaire construit depuis la demande : son @id est celui de la demande
    expect(result.current.questionnaire?.["@id"]).toBe("/demandes/1");

    // La demande part en premier ; typeDemande et campagne, qui en dépendent, suivent.
    expect(requested[0]).toBe("/demandes/1");
    expect(requested).toContain("/types_demandes/5");
    expect(requested).toContain("/campagne");
  });

  it("mutation PUT → refetch de la demande", async () => {
    let demandeCalls = 0;
    let putCalled = false;

    server.use(
      http.get(`${BASE_URL}/demandes/1`, () => {
        demandeCalls += 1;
        return HttpResponse.json(demande);
      }),
      http.get(`${BASE_URL}/types_demandes/5`, () => HttpResponse.json(typeDemande)),
      http.get(`${BASE_URL}/types_demandes/5/campagnes/9`, () => HttpResponse.json(campagne)),
      http.put(`${BASE_URL}/demandes/1/questions/3/reponse`, () => {
        putCalled = true;
        return HttpResponse.json({ "@id": "/demandes/1/questions/3/reponse" });
      }),
    );

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: makeWrapper({ demandeId: "/demandes/1" }),
    });

    await waitFor(() => expect(result.current.demande).toBeDefined(), { timeout: 3000 });
    const callsBefore = demandeCalls;

    act(() => {
      result.current.questUtils?.envoyerReponse("/questions/3", "textarea", "ma réponse");
    });

    await waitFor(() => expect(putCalled).toBe(true), { timeout: 3000 });
    await waitFor(() => expect(demandeCalls).toBeGreaterThan(callsBefore), { timeout: 3000 });
  });

  it("mode admin (typeDemandeId seul) → questionnaire construit depuis typeDemande", async () => {
    server.use(http.get(`${BASE_URL}/types_demandes/5`, () => HttpResponse.json(typeDemande)));

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: makeWrapper({ typeDemandeId: "/types_demandes/5" }),
    });

    await waitFor(() => expect(result.current.questionnaire).toBeDefined(), { timeout: 3000 });

    // En mode admin le questionnaire prend l'@id du typeDemande, pas d'une demande.
    expect(result.current.questionnaire?.["@id"]).toBe("/types_demandes/5");
    expect(result.current.demande).toBeUndefined();
  });

  it("auth.user absent → toutes les fonctionnalités bloquées", async () => {
    mockUser = null;

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: makeWrapper({}),
    });

    await waitFor(() => expect(result.current.questUtils).toBeDefined());

    expect(
      result.current.questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.MODIFIER_QUESTIONNAIRE),
    ).toBe(false);
  });

  it("ROLE_MEMBRE_COMMISSION : droits fonctionnels — résultat selon rolesCommission", async () => {
    mockUser = { uid: "mc@test.fr", roles: ["ROLE_MEMBRE_COMMISSION"] };

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: makeWrapper({}),
    });

    await waitFor(() => expect(result.current.questUtils).toBeDefined());

    // Sans le role requis dans rolesCommission → accès refusé
    expect(
      result.current.questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.ATTRIBUER_PROFIL, []),
    ).toBe(false);

    // Avec le role requis → accès accordé
    expect(
      result.current.questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.ATTRIBUER_PROFIL, [
        "ROLE_ATTRIBUER_PROFIL",
      ]),
    ).toBe(true);
  });

  it("ROLE_GESTIONNAIRE → fonctionnalité autorisée (droits booléens)", async () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: makeWrapper({}),
    });

    await waitFor(() => expect(result.current.questUtils).toBeDefined());

    expect(
      result.current.questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.MODIFIER_QUESTIONNAIRE),
    ).toBe(true);
  });
});
