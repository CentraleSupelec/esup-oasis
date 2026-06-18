// NOTE: le hook exposé est { enabled, toggle } — il ne lit/écrit pas directement
// des clés sessionStorage avec JSON. Il wrappe usePreferences() du contexte utilisateur
// et gère uniquement la préférence "conserverFiltres". Les cas du prompt décrivaient
// une API inexistante ; les tests ci-dessous couvrent l'implémentation réelle.

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFiltreSessionStorage, PREF_KEY_CONSERVER_FILTRES } from "./useFiltreSessionStorage";

vi.mock("@context/utilisateurPreferences/UtilisateurPreferencesProvider", () => ({
  usePreferences: vi.fn(),
}));

import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";

const mockUsePreferences = vi.mocked(usePreferences);

describe("useFiltreSessionStorage", () => {
  let mockGetPreference: ReturnType<typeof vi.fn>;
  let mockSetPreference: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockGetPreference = vi.fn().mockReturnValue(undefined);
    mockSetPreference = vi.fn();
    mockUsePreferences.mockReturnValue({
      getPreference: mockGetPreference,
      setPreference: mockSetPreference,
    } as unknown as ReturnType<typeof usePreferences>);
  });

  // --- état enabled ---

  it("enabled = false quand la préférence est absente", () => {
    mockGetPreference.mockReturnValue(undefined);
    const { result } = renderHook(() => useFiltreSessionStorage());
    expect(result.current.enabled).toBe(false);
  });

  it('enabled = true quand la préférence vaut "true"', () => {
    mockGetPreference.mockReturnValue("true");
    const { result } = renderHook(() => useFiltreSessionStorage());
    expect(result.current.enabled).toBe(true);
  });

  it('enabled = false quand la préférence vaut "false"', () => {
    mockGetPreference.mockReturnValue("false");
    const { result } = renderHook(() => useFiltreSessionStorage());
    expect(result.current.enabled).toBe(false);
  });

  // --- toggle ---

  it('toggle(true) → appelle setPreference avec "true", ne touche pas sessionStorage', () => {
    sessionStorage.setItem("oasis:filter:test", "valeur");
    const { result } = renderHook(() => useFiltreSessionStorage());

    act(() => {
      result.current.toggle(true);
    });

    expect(mockSetPreference).toHaveBeenCalledWith(PREF_KEY_CONSERVER_FILTRES, "true");
    expect(sessionStorage.getItem("oasis:filter:test")).toBe("valeur");
  });

  it('toggle(false) → appelle setPreference avec "false" et nettoie les clés "oasis:filter:"', () => {
    sessionStorage.setItem("oasis:filter:foo", "v1");
    sessionStorage.setItem("oasis:filter:bar", "v2");
    sessionStorage.setItem("autre:cle", "inchangé");
    const { result } = renderHook(() => useFiltreSessionStorage());

    act(() => {
      result.current.toggle(false);
    });

    expect(mockSetPreference).toHaveBeenCalledWith(PREF_KEY_CONSERVER_FILTRES, "false");
    expect(sessionStorage.getItem("oasis:filter:foo")).toBeNull();
    expect(sessionStorage.getItem("oasis:filter:bar")).toBeNull();
    expect(sessionStorage.getItem("autre:cle")).toBe("inchangé");
  });
});
