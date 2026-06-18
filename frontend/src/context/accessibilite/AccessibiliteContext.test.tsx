import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AccessibiliteProvider, useAccessibilite } from "./AccessibiliteContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AccessibiliteProvider>{children}</AccessibiliteProvider>;
}

describe("useAccessibilite — hors provider", () => {
  it("lance une Error explicite", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAccessibilite())).toThrow(
      "useAccessibilite must be used within AccessibiliteProvider",
    );
    spy.mockRestore();
  });
});

describe("AccessibiliteProvider — reducer", () => {
  it("état initial : tout à false", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    expect(result.current.accessibilite).toEqual({
      contrast: false,
      dyslexieArial: false,
      dyslexieOpenDys: false,
      dyslexieLexend: false,
      policeLarge: false,
    });
  });

  it("setContrast(true) → seul contrast change", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setContrast(true));
    expect(result.current.accessibilite).toMatchObject({
      contrast: true,
      dyslexieArial: false,
      dyslexieOpenDys: false,
      dyslexieLexend: false,
      policeLarge: false,
    });
  });

  it("setContrast(true) puis setContrast(false) → contrast = false", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setContrast(true));
    act(() => result.current.setContrast(false));
    expect(result.current.accessibilite.contrast).toBe(false);
  });

  it("setPoliceLarge(true) → seul policeLarge change", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setPoliceLarge(true));
    expect(result.current.accessibilite).toMatchObject({
      policeLarge: true,
      contrast: false,
      dyslexieArial: false,
    });
  });

  it("setDyslexieArial(true) → Arial=true, OpenDys=false, Lexend=false", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setDyslexieArial(true));
    expect(result.current.accessibilite.dyslexieArial).toBe(true);
    expect(result.current.accessibilite.dyslexieOpenDys).toBe(false);
    expect(result.current.accessibilite.dyslexieLexend).toBe(false);
  });

  it("setDyslexieOpenDys(true) → OpenDys=true, Arial=false, Lexend=false", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setDyslexieArial(true));
    act(() => result.current.setDyslexieOpenDys(true));
    expect(result.current.accessibilite.dyslexieOpenDys).toBe(true);
    expect(result.current.accessibilite.dyslexieArial).toBe(false);
    expect(result.current.accessibilite.dyslexieLexend).toBe(false);
  });

  it("setDyslexieLexend(true) → Lexend=true, Arial=false, OpenDys=false", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setDyslexieArial(true));
    act(() => result.current.setDyslexieLexend(true));
    expect(result.current.accessibilite.dyslexieLexend).toBe(true);
    expect(result.current.accessibilite.dyslexieArial).toBe(false);
    expect(result.current.accessibilite.dyslexieOpenDys).toBe(false);
  });

  it("enchaînement Arial→OpenDys : Arial bien désactivé", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setDyslexieArial(true));
    expect(result.current.accessibilite.dyslexieArial).toBe(true);
    act(() => result.current.setDyslexieOpenDys(true));
    expect(result.current.accessibilite.dyslexieArial).toBe(false);
    expect(result.current.accessibilite.dyslexieOpenDys).toBe(true);
  });

  it("l'exclusion mutuelle ne touche ni contrast ni policeLarge", () => {
    const { result } = renderHook(() => useAccessibilite(), { wrapper });
    act(() => result.current.setContrast(true));
    act(() => result.current.setPoliceLarge(true));
    act(() => result.current.setDyslexieArial(true));
    act(() => result.current.setDyslexieOpenDys(true));
    expect(result.current.accessibilite.contrast).toBe(true);
    expect(result.current.accessibilite.policeLarge).toBe(true);
  });
});
