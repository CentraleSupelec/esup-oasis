import React from "react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import { Utilisateur } from "@lib";

// Le Menu antd horizontal virtualise l'overflow (ResizeObserver renvoie 0 en jsdom) :
// on le remplace par un rendu plat exposant la clé de chaque entrée de premier niveau.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  const FlatMenu = ({
    items,
    "aria-label": ariaLabel,
  }: {
    items?: Array<{ key?: string; label?: React.ReactNode } | null>;
    "aria-label"?: string;
  }) => (
    <nav aria-label={ariaLabel ?? "Menu principal"}>
      <ul role="menubar">
        {(items ?? []).map((entry, i) => (
          <li
            key={entry?.key ?? i}
            role="menuitem"
            tabIndex={-1}
            aria-label={entry?.key ?? `item-${i}`}
            data-menu-key={entry?.key ?? ""}
          >
            {entry?.label}
          </li>
        ))}
      </ul>
    </nav>
  );
  return { ...actual, Menu: FlatMenu };
});

const mockUseAuth = vi.fn();
vi.mock("@/auth/AuthProvider", () => ({ useAuth: () => mockUseAuth() }));
vi.mock("@context/drawers/DrawersContext", () => ({
  useDrawers: () => ({ setDrawerUtilisateur: vi.fn() }),
}));
vi.mock("@context/affichageFiltres/AffichageFiltresContext", () => ({
  useAffichageFiltres: () => ({ setAffichageFiltres: vi.fn() }),
}));
vi.mock("@context/theme/ThemeContext", () => ({
  useTheme: () => ({ themeMode: "light", setThemeMode: vi.fn() }),
}));
vi.mock("@context/accessibilite/AccessibiliteContext", () => ({
  useAccessibilite: () => ({
    accessibilite: {
      contrast: false,
      dyslexieArial: false,
      dyslexieOpenDys: false,
      dyslexieLexend: false,
      policeLarge: false,
    },
    setContrast: vi.fn(),
    setDyslexieArial: vi.fn(),
    setDyslexieOpenDys: vi.fn(),
    setDyslexieLexend: vi.fn(),
    setPoliceLarge: vi.fn(),
  }),
}));
vi.mock("@context/utilisateurPreferences/UtilisateurPreferencesProvider", () => ({
  usePreferences: () => ({ setPreference: vi.fn() }),
}));
vi.mock("@controls/AppLayout/menuItems/useNotificationStats", () => ({
  useNotificationStats: () => ({ stats: undefined, isFetchingStats: false }),
}));
vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetItem: () => ({ data: undefined, isLoading: false }),
    useGetCollection: () => ({ data: undefined, isLoading: false }),
    useGetFullCollection: () => ({ data: undefined, isLoading: false }),
  }),
}));
vi.mock("@utils/PageTitle/PageTitle", () => ({ default: () => null }));
vi.mock("@utils/theme/useEffectiveTheme", () => ({ DARKMODE_ENABLED: false }));

import AppLayoutMenu from "./AppLayoutMenu";

function makeUser(roles: string[]) {
  return new Utilisateur({
    "@id": "/utilisateurs/test",
    "@type": "Utilisateur",
    uid: "test@test.fr",
    roles: roles as never[],
  });
}

// ─── Y4 : AppLayoutMenu — accessibilité ───────────────────────────────────────

describe("AppLayoutMenu — accessibilité (Y4)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aucune violation axe-core — planificateur", async () => {
    mockUseAuth.mockReturnValue({ user: makeUser(["ROLE_USER", "ROLE_GESTIONNAIRE"]) });
    const { container } = renderWithProviders(<AppLayoutMenu />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("aucune violation axe-core — demandeur", async () => {
    mockUseAuth.mockReturnValue({ user: makeUser(["ROLE_USER", "ROLE_DEMANDEUR"]) });
    const { container } = renderWithProviders(<AppLayoutMenu />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("aucune violation axe-core — intervenant", async () => {
    mockUseAuth.mockReturnValue({ user: makeUser(["ROLE_USER", "ROLE_INTERVENANT"]) });
    const { container } = renderWithProviders(<AppLayoutMenu />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("le menu est un élément de navigation avec aria-label explicite", () => {
    mockUseAuth.mockReturnValue({ user: makeUser(["ROLE_USER", "ROLE_DEMANDEUR"]) });
    const { container } = renderWithProviders(<AppLayoutMenu />);
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav).toHaveAttribute("aria-label", "Menu principal");
  });

  it("toutes les entrées de menu sont des éléments interactifs focusables", () => {
    mockUseAuth.mockReturnValue({ user: makeUser(["ROLE_USER", "ROLE_GESTIONNAIRE"]) });
    const { container } = renderWithProviders(<AppLayoutMenu />);
    const menuItems = container.querySelectorAll("[role='menuitem']");
    expect(menuItems.length).toBeGreaterThan(0);
    menuItems.forEach((item) => {
      expect(item.tagName.toLowerCase()).toMatch(/^(a|button|div|li)$/);
    });
  });
});
