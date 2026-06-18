import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DrawersProvider, useDrawers } from "./DrawersContext";
import { RoleValues } from "@lib";

function wrapper({ children }: { children: React.ReactNode }) {
  return <DrawersProvider>{children}</DrawersProvider>;
}

describe("useDrawers — hors provider", () => {
  it("lance une Error explicite", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useDrawers())).toThrow(
      "useDrawers must be used within DrawersProvider",
    );
    spy.mockRestore();
  });
});

describe("DrawersProvider", () => {
  it("état initial : tous les drawers fermés", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    expect(result.current.drawers.EVENEMENT).toBeUndefined();
    expect(result.current.drawers.UTILISATEUR).toBeUndefined();
    expect(result.current.drawers.UTILISATEUR_ROLE).toBeUndefined();
  });

  it("setDrawerEvenement ouvre le drawer événement", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    act(() => result.current.setDrawerEvenement("/evenements/42"));
    expect(result.current.drawers.EVENEMENT).toBe("/evenements/42");
  });

  it("setDrawerEvenement(undefined) ferme le drawer événement", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    act(() => result.current.setDrawerEvenement("/evenements/42"));
    act(() => result.current.setDrawerEvenement(undefined));
    expect(result.current.drawers.EVENEMENT).toBeUndefined();
  });

  it("setDrawerUtilisateur ouvre le drawer avec uid et rôle", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    act(() =>
      result.current.setDrawerUtilisateur({
        utilisateur: "/utilisateurs/1",
        role: RoleValues.ROLE_INTERVENANT,
      }),
    );
    expect(result.current.drawers.UTILISATEUR).toBe("/utilisateurs/1");
    expect(result.current.drawers.UTILISATEUR_ROLE).toBe(RoleValues.ROLE_INTERVENANT);
  });

  it("setDrawerUtilisateur(undefined) ferme le drawer utilisateur", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    act(() => result.current.setDrawerUtilisateur({ utilisateur: "/utilisateurs/1" }));
    act(() => result.current.setDrawerUtilisateur(undefined));
    expect(result.current.drawers.UTILISATEUR).toBeUndefined();
  });

  it("drawer événement et drawer utilisateur sont indépendants", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    act(() => result.current.setDrawerEvenement("/evenements/1"));
    act(() => result.current.setDrawerUtilisateur({ utilisateur: "/utilisateurs/2" }));
    expect(result.current.drawers.EVENEMENT).toBe("/evenements/1");
    expect(result.current.drawers.UTILISATEUR).toBe("/utilisateurs/2");
  });

  it("closeAllDrawers ferme tous les drawers", () => {
    const { result } = renderHook(() => useDrawers(), { wrapper });
    act(() => result.current.setDrawerEvenement("/evenements/1"));
    act(() => result.current.setDrawerUtilisateur({ utilisateur: "/utilisateurs/2" }));
    act(() => result.current.closeAllDrawers());
    expect(result.current.drawers.EVENEMENT).toBeUndefined();
    expect(result.current.drawers.UTILISATEUR).toBeUndefined();
  });
});
