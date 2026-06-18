import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { ThemeProvider, useTheme, ThemeMode } from "./ThemeContext";

const STORAGE_KEY = "theme-mode";

function renderThemeHook() {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children),
  });
}

// ─── Y5 — ThemeContext ────────────────────────────────────────────────────────

describe("ThemeContext — persistance et lecture (Y5)", () => {
  beforeEach(() => localStorage.clear());

  it("valeur par défaut : 'system' quand aucune entrée localStorage", () => {
    const { result } = renderThemeHook();
    expect(result.current.themeMode).toBe("system");
  });

  it("lit la valeur stockée dans localStorage à l'initialisation", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    const { result } = renderThemeHook();
    expect(result.current.themeMode).toBe("dark");
  });

  it("ignore une valeur invalide dans localStorage et revient à 'system'", () => {
    localStorage.setItem(STORAGE_KEY, "invalid-value");
    const { result } = renderThemeHook();
    expect(result.current.themeMode).toBe("system");
  });

  it.each<ThemeMode>(["light", "dark", "system"])(
    "setThemeMode('%s') met à jour l'état et localStorage",
    (mode) => {
      const { result } = renderThemeHook();
      act(() => result.current.setThemeMode(mode));
      expect(result.current.themeMode).toBe(mode);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(mode);
    },
  );
});
