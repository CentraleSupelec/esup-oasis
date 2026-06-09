import React from "react";
import { render, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UtilisateurPreferencesProvider, usePreferences } from "./UtilisateurPreferencesProvider";

const mockMutate = vi.fn();
const mockUsePut = vi.fn(() => ({ mutate: mockMutate }));
const mockUseGetFullCollection = vi.fn();

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetFullCollection: mockUseGetFullCollection,
    usePut: mockUsePut,
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { "@id": "/utilisateurs/u1", uid: "u1" } }),
}));

const mockSetThemeMode = vi.fn();
const mockSetContrast = vi.fn();
const mockSetDyslexieArial = vi.fn();
const mockSetDyslexieOpenDys = vi.fn();
const mockSetDyslexieLexend = vi.fn();
const mockSetPoliceLarge = vi.fn();

vi.mock("@context/theme/ThemeContext", () => ({
  useTheme: () => ({ setThemeMode: mockSetThemeMode, themeMode: "system" }),
}));

vi.mock("@context/accessibilite/AccessibiliteContext", () => ({
  useAccessibilite: () => ({
    setContrast: mockSetContrast,
    setDyslexieArial: mockSetDyslexieArial,
    setDyslexieOpenDys: mockSetDyslexieOpenDys,
    setDyslexieLexend: mockSetDyslexieLexend,
    setPoliceLarge: mockSetPoliceLarge,
    accessibilite: {},
  }),
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

function pref(cle: string, valeur: string) {
  return { "@id": `/utilisateurs/u1/parametres_ui/${cle}`, valeur };
}

function makePreferences(items: ReturnType<typeof pref>[]) {
  return { data: { items, totalItems: items.length } };
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <UtilisateurPreferencesProvider>{children}</UtilisateurPreferencesProvider>;
}

describe("UtilisateurPreferencesProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePut.mockReturnValue({ mutate: mockMutate });
  });

  it("theme-mode est appliqué avant contrast", async () => {
    const callOrder: string[] = [];
    mockSetThemeMode.mockImplementation(() => callOrder.push("setThemeMode"));
    mockSetContrast.mockImplementation(() => callOrder.push("setContrast"));

    mockUseGetFullCollection.mockReturnValue(
      makePreferences([pref("theme-mode", "dark"), pref("contrast", "true")]),
    );

    render(<UtilisateurPreferencesProvider>{null}</UtilisateurPreferencesProvider>);

    await waitFor(() => expect(mockSetThemeMode).toHaveBeenCalled());
    await waitFor(() => expect(mockSetContrast).toHaveBeenCalled());

    expect(callOrder.indexOf("setThemeMode")).toBeLessThan(callOrder.indexOf("setContrast"));
  });

  it("setThemeMode reçoit la valeur correcte", async () => {
    mockUseGetFullCollection.mockReturnValue(makePreferences([pref("theme-mode", "dark")]));

    render(<UtilisateurPreferencesProvider>{null}</UtilisateurPreferencesProvider>);

    await waitFor(() => expect(mockSetThemeMode).toHaveBeenCalledWith("dark"));
  });

  it("valeur JSON malformée dans getPreferenceJson → fallback {}", async () => {
    mockUseGetFullCollection.mockReturnValue(
      makePreferences([pref("ma-pref", "invalid json {{{")]),
    );

    const { result } = renderHook(() => usePreferences(), { wrapper });

    await waitFor(() => expect(result.current.preferencesChargees).toBe(true));
    expect(() => result.current.getPreferenceJson("ma-pref")).not.toThrow();
    expect(result.current.getPreferenceJson("ma-pref")).toEqual({});
  });

  it("valeur JSON malformée dans getPreferenceArray → fallback []", async () => {
    mockUseGetFullCollection.mockReturnValue(makePreferences([pref("ma-liste", "not an array")]));

    const { result } = renderHook(() => usePreferences(), { wrapper });

    await waitFor(() => expect(result.current.preferencesChargees).toBe(true));
    expect(() => result.current.getPreferenceArray("ma-liste")).not.toThrow();
    expect(result.current.getPreferenceArray("ma-liste")).toEqual([]);
  });

  it("setPreference → mutate appelé avec @id et data corrects", async () => {
    mockUseGetFullCollection.mockReturnValue(makePreferences([]));

    const { result } = renderHook(() => usePreferences(), { wrapper });

    result.current.setPreference("theme-mode", "light");

    expect(mockMutate).toHaveBeenCalledOnce();
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        "@id": "/utilisateurs/u1/parametres_ui/theme-mode",
        data: { valeur: "light" },
      }),
    );
  });

  it("usePut est configuré avec invalidationQueryKeys pour les préférences", () => {
    mockUseGetFullCollection.mockReturnValue(makePreferences([]));

    render(<UtilisateurPreferencesProvider>{null}</UtilisateurPreferencesProvider>);

    expect(mockUsePut).toHaveBeenCalledWith(
      expect.objectContaining({
        invalidationQueryKeys: expect.arrayContaining(["/utilisateurs/{uid}/parametres_ui"]),
      }),
    );
  });
});
