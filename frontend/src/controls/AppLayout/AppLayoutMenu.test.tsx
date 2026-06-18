/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test";
import { Utilisateur } from "@lib";

// Le Menu antd horizontal virtualise l'overflow (ResizeObserver renvoie 0 en jsdom) :
// on le remplace par un rendu plat exposant la clé de chaque entrée de premier niveau.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  const FlatMenu = ({
    items,
  }: {
    items?: Array<{ key?: string; label?: React.ReactNode } | null>;
  }) => (
    <ul aria-label="Menu principal">
      {(items ?? []).map((entry, i) => (
        <li key={entry?.key ?? i} data-menu-key={entry?.key ?? ""}>
          {entry?.label}
        </li>
      ))}
    </ul>
  );
  return { ...actual, Menu: FlatMenu };
});

// -- Hooks/contextes lourds mockés (non pertinents pour la visibilité par rôle) --
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
// UtilisateurAvatar (entrée « utilisateur ») consomme useApi → stub.
vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetItem: () => ({ data: undefined, isLoading: false }),
    useGetCollection: () => ({ data: undefined, isLoading: false }),
    useGetFullCollection: () => ({ data: undefined, isLoading: false }),
  }),
}));
vi.mock("@utils/PageTitle/PageTitle", () => ({ default: () => null }));
vi.mock("@utils/theme/useEffectiveTheme", () => ({ DARKMODE_ENABLED: true }));

import AppLayoutMenu from "./AppLayoutMenu";

function makeUser(roles: string[]) {
  return new Utilisateur({
    "@id": "/utilisateurs/test",
    "@type": "Utilisateur",
    uid: "test@test.fr",
    roles: roles as never[],
  });
}

function renderMenu(roles: string[]) {
  mockUseAuth.mockReturnValue({ user: makeUser(roles), authenticate: vi.fn() });
  return renderWithProviders(<AppLayoutMenu />);
}

function menuKeys(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("[data-menu-key]"))
    .map((el) => el.getAttribute("data-menu-key"))
    .filter((k): k is string => Boolean(k));
}

describe("AppLayoutMenu — visibilité des entrées par rôle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("planificateur : voit demandeurs, bénéficiaires, intervenants, planning et recherche", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_GESTIONNAIRE"]);
    const keys = menuKeys(container);
    expect(keys).toEqual(
      expect.arrayContaining([
        "demandeurs",
        "beneficiaires",
        "intervenants",
        "planning",
        "rechercher",
      ]),
    );
    // Pas les entrées spécifiques demandeur/intervenant simple.
    expect(keys).not.toContain("services-faits");
  });

  it("demandeur simple : voit l'entrée Demandes, pas les écrans de gestion ni la recherche", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_DEMANDEUR"]);
    const keys = menuKeys(container);
    expect(keys).toContain("demandes");
    expect(keys).not.toContain("demandeurs");
    expect(keys).not.toContain("beneficiaires");
    expect(keys).not.toContain("intervenants");
    expect(keys).not.toContain("rechercher");
  });

  it("intervenant simple : voit planning et services faits, pas les écrans planificateur", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_INTERVENANT"]);
    const keys = menuKeys(container);
    expect(keys).toContain("planning");
    expect(keys).toContain("services-faits");
    expect(keys).not.toContain("demandeurs");
    expect(keys).not.toContain("rechercher");
  });

  it("bénéficiaire simple : voit le planning, pas les écrans planificateur", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_BENEFICIAIRE"]);
    const keys = menuKeys(container);
    expect(keys).toContain("planning");
    expect(keys).not.toContain("services-faits");
    expect(keys).not.toContain("rechercher");
  });

  it("membre de commission (non planificateur) : voit l'entrée des demandes de commission", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_MEMBRE_COMMISSION"]);
    const keys = menuKeys(container);
    expect(keys).toContain("demandeurs-commission");
    expect(keys).not.toContain("demandeurs");
    expect(keys).not.toContain("rechercher");
  });

  it("référent de composante (non planificateur) : voit l'entrée des aménagements", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_REFERENT_COMPOSANTE"]);
    const keys = menuKeys(container);
    expect(keys).toContain("beneficiaires-referent");
    expect(keys).not.toContain("beneficiaires");
    expect(keys).not.toContain("rechercher");
  });

  it("toujours présentes : entrées transverses (accessibilité, utilisateur)", () => {
    const { container } = renderMenu(["ROLE_USER", "ROLE_DEMANDEUR"]);
    const keys = menuKeys(container);
    expect(keys).toContain("accessibilite");
    expect(keys).toContain("user");
  });
});
