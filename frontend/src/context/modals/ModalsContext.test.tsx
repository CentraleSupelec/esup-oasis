import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ModalsProvider, useModals } from "./ModalsContext";
import type { IEvenement } from "@api";

function wrapper({ children }: { children: React.ReactNode }) {
  return <ModalsProvider>{children}</ModalsProvider>;
}

describe("useModals — hors provider", () => {
  it("lance une Error explicite", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useModals())).toThrow(
      "useModals must be used within ModalsProvider",
    );
    spy.mockRestore();
  });
});

describe("ModalsProvider", () => {
  it("état initial : toutes les modals fermées", () => {
    const { result } = renderHook(() => useModals(), { wrapper });
    expect(result.current.modals.EVENEMENT_ID).toBeUndefined();
    expect(result.current.modals.EVENEMENT).toBeUndefined();
  });

  it("setModalEvenementId ouvre la modal avec l'id", () => {
    const { result } = renderHook(() => useModals(), { wrapper });
    act(() => result.current.setModalEvenementId("/evenements/7"));
    expect(result.current.modals.EVENEMENT_ID).toBe("/evenements/7");
  });

  it("setModalEvenementId(undefined) ferme la modal", () => {
    const { result } = renderHook(() => useModals(), { wrapper });
    act(() => result.current.setModalEvenementId("/evenements/7"));
    act(() => result.current.setModalEvenementId(undefined));
    expect(result.current.modals.EVENEMENT_ID).toBeUndefined();
  });

  it("setModalEvenement stocke l'objet événement", () => {
    const { result } = renderHook(() => useModals(), { wrapper });
    const evt = { "@id": "/evenements/5" } as IEvenement;
    act(() => result.current.setModalEvenement(evt));
    expect(result.current.modals.EVENEMENT?.["@id"]).toBe("/evenements/5");
  });

  it("EVENEMENT_ID et EVENEMENT sont indépendants", () => {
    const { result } = renderHook(() => useModals(), { wrapper });
    act(() => result.current.setModalEvenementId("/evenements/3"));
    act(() => result.current.setModalEvenement({ "@id": "/evenements/5" } as IEvenement));
    expect(result.current.modals.EVENEMENT_ID).toBe("/evenements/3");
    expect(result.current.modals.EVENEMENT?.["@id"]).toBe("/evenements/5");
  });

  it("setModalEvenement(undefined) efface l'événement", () => {
    const { result } = renderHook(() => useModals(), { wrapper });
    act(() => result.current.setModalEvenement({ "@id": "/evenements/5" } as IEvenement));
    act(() => result.current.setModalEvenement(undefined));
    expect(result.current.modals.EVENEMENT).toBeUndefined();
  });
});
