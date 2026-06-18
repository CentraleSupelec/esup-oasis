import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  AffichageFiltresProvider,
  DensiteValues,
  IFiltresEvenements,
  PlanningLayout,
  useAffichageFiltres,
} from "./AffichageFiltresContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AffichageFiltresProvider>{children}</AffichageFiltresProvider>;
}

describe("useAffichageFiltres — hors provider", () => {
  it("lance une Error explicite", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAffichageFiltres())).toThrow(
      "useAffichageFiltres must be used within AffichageFiltresProvider",
    );
    spy.mockRestore();
  });
});

describe("AffichageFiltresProvider", () => {
  it("état initial : affichage par défaut", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    expect(result.current.affichageFiltres.affichage).toMatchObject({
      type: "work_week",
      densite: DensiteValues.normal,
      fitToScreen: false,
      layout: PlanningLayout.calendar,
    });
  });

  it("état initial : filtres contiennent des dates Date", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    expect(result.current.affichageFiltres.filtres.debut).toBeInstanceOf(Date);
    expect(result.current.affichageFiltres.filtres.fin).toBeInstanceOf(Date);
  });

  it("setAffichage met à jour partiellement affichage, préserve le reste", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    act(() => result.current.setAffichage({ fitToScreen: true, layout: PlanningLayout.table }));
    expect(result.current.affichageFiltres.affichage.fitToScreen).toBe(true);
    expect(result.current.affichageFiltres.affichage.layout).toBe(PlanningLayout.table);
    expect(result.current.affichageFiltres.affichage.densite).toBe(DensiteValues.normal);
  });

  it("setFiltres (merge) ajoute un filtre sans écraser les dates", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    act(() => result.current.setFiltres({ intervenant: "/utilisateurs/1" }));
    expect(result.current.affichageFiltres.filtres.intervenant).toBe("/utilisateurs/1");
    expect(result.current.affichageFiltres.filtres.debut).toBeInstanceOf(Date);
  });

  it("setFiltres(value, replace=true) remplace les filtres entièrement", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    act(() => result.current.setFiltres({ intervenant: "/utilisateurs/1" }));
    const newFiltres: IFiltresEvenements = {
      debut: new Date("2024-01-01"),
      fin: new Date("2024-01-07"),
    };
    act(() => result.current.setFiltres(newFiltres, true));
    expect(result.current.affichageFiltres.filtres.debut).toEqual(new Date("2024-01-01"));
    expect(result.current.affichageFiltres.filtres.intervenant).toBeUndefined();
  });

  it("setAffichageFiltres met à jour affichage et filtres simultanément", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    act(() =>
      result.current.setAffichageFiltres({ type: "day" }, { beneficiaire: "/utilisateurs/2" }),
    );
    expect(result.current.affichageFiltres.affichage.type).toBe("day");
    expect(result.current.affichageFiltres.filtres.beneficiaire).toBe("/utilisateurs/2");
    expect(result.current.affichageFiltres.affichage.densite).toBe(DensiteValues.normal);
  });

  it("restoreFiltres remplace complètement les filtres", () => {
    const { result } = renderHook(() => useAffichageFiltres(), { wrapper });
    act(() => result.current.setFiltres({ intervenant: "/utilisateurs/1" }));
    const restored: IFiltresEvenements = {
      debut: new Date("2024-06-01"),
      fin: new Date("2024-06-07"),
    };
    act(() => result.current.restoreFiltres(restored));
    expect(result.current.affichageFiltres.filtres.debut).toEqual(new Date("2024-06-01"));
    expect(result.current.affichageFiltres.filtres.intervenant).toBeUndefined();
  });
});
