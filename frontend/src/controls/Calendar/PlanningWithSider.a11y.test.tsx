import React from "react";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { screen } from "@testing-library/react";
import { App } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlanningWithSider from "./PlanningWithSider";
import { PlanningLayout } from "@context/affichageFiltres/AffichageFiltresContext";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockUseAffichageFiltres, mockUseGetFullCollection, mockUsePatch } = vi.hoisted(() => ({
  mockUseAffichageFiltres: vi.fn(),
  mockUseGetFullCollection: vi.fn(() => ({ data: undefined, isFetching: false })),
  mockUsePatch: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@context/affichageFiltres/AffichageFiltresContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@context/affichageFiltres/AffichageFiltresContext")>();
  return {
    ...actual,
    useAffichageFiltres: mockUseAffichageFiltres,
    filtreToApi: () => ({}),
    filtrerEvenements: (_events: unknown[]) => _events,
  };
});

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetFullCollection: mockUseGetFullCollection,
    usePatch: mockUsePatch,
  }),
}));

vi.mock("@controls/Calendar/Sider/CalendarSider", () => ({
  default: () => (
    <aside aria-label="Sider du planning">
      <h2>Filtres</h2>
    </aside>
  ),
}));

vi.mock("@controls/Calendar/Toolbar/Toolbar", () => ({
  default: () => (
    <nav aria-label="Barre d'outils du planning">
      <button type="button">Aujourd'hui</button>
    </nav>
  ),
}));

vi.mock("@controls/Calendar/Calendar/Calendar", () => ({
  default: () => (
    <section aria-label="Calendrier des événements">
      <p>Aucun événement</p>
    </section>
  ),
}));

vi.mock("@controls/Calendar/Table/CalendarTable", () => ({
  default: () => (
    <section aria-label="Tableau des événements">
      <p>Aucun événement</p>
    </section>
  ),
}));

vi.mock("@controls/Calendar/TimezoneAlert", () => ({
  TimezoneAlert: () => null,
}));

vi.mock("@controls/Spinner/Spinner", () => ({
  default: () => <div role="status" aria-label="Chargement en cours" />,
}));

vi.mock("@utils/dates", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@utils/dates")>();
  return {
    ...actual,
    calculateRange: () => ({
      from: "2026-01-01",
      to: "2026-01-31",
    }),
  };
});

function makeAffichageFiltres(layout = PlanningLayout.calendar) {
  return {
    affichageFiltres: {
      filtres: { type: ["type/1"], debut: "2026-01-01", fin: "2026-01-31" },
      affichage: { type: "month", layout },
    },
    setFiltres: vi.fn(),
  };
}

function renderPlanning(jsx: React.ReactElement) {
  // Layout.Content (Ant Design) rend un <main> — pas besoin de wrapper supplémentaire
  return render(<App>{jsx}</App>);
}

// ─── Y14 (composant délégué) : PlanningWithSider — accessibilité ──────────────

describe("PlanningWithSider — accessibilité", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetFullCollection.mockReturnValue({ data: undefined, isFetching: false });
    mockUsePatch.mockReturnValue({ mutate: vi.fn() });
    mockUseAffichageFiltres.mockReturnValue(makeAffichageFiltres());
  });

  // ── Vue calendrier ─────────────────────────────────────────────────────────

  describe("vue calendrier (layout par défaut)", () => {
    it("aucune violation axe-core", async () => {
      renderPlanning(<PlanningWithSider />);
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it("le titre h1 sr-only 'Planning' est présent pour les lecteurs d'écran", () => {
      renderPlanning(<PlanningWithSider />);
      const h1 = screen.getByRole("heading", { level: 1, name: /planning/i });
      expect(h1).toBeInTheDocument();
      expect(h1.classList.contains("sr-only")).toBe(true);
    });

    it("la barre d'outils est accessible", () => {
      renderPlanning(<PlanningWithSider />);
      expect(screen.getByRole("navigation", { name: /barre d.outils/i })).toBeInTheDocument();
    });

    it("le sider de filtres est accessible", () => {
      renderPlanning(<PlanningWithSider />);
      expect(screen.getByRole("complementary", { name: /sider/i })).toBeInTheDocument();
    });

    it("la vue calendrier est rendue avec une région accessible", () => {
      renderPlanning(<PlanningWithSider />);
      expect(
        screen.getByRole("region", { name: /calendrier des événements/i }),
      ).toBeInTheDocument();
    });
  });

  // ── Vue tableau ────────────────────────────────────────────────────────────

  describe("vue tableau (layout table)", () => {
    beforeEach(() => {
      mockUseAffichageFiltres.mockReturnValue(makeAffichageFiltres(PlanningLayout.table));
    });

    it("aucune violation axe-core", async () => {
      renderPlanning(<PlanningWithSider />);
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it("la vue tableau est rendue avec une région accessible", () => {
      renderPlanning(<PlanningWithSider />);
      expect(screen.getByRole("region", { name: /tableau des événements/i })).toBeInTheDocument();
    });
  });

  // ── État chargement ────────────────────────────────────────────────────────

  describe("état de chargement (isFetching=true)", () => {
    beforeEach(() => {
      mockUseGetFullCollection.mockReturnValue({ data: undefined, isFetching: true });
    });

    it("aucune violation axe-core pendant le chargement", async () => {
      renderPlanning(<PlanningWithSider />);
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it("le spinner de chargement a un rôle et un label accessibles", () => {
      renderPlanning(<PlanningWithSider />);
      expect(screen.getByRole("status", { name: /chargement en cours/i })).toBeInTheDocument();
    });
  });
});
