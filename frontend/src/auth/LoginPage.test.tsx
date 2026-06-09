/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import LoginPage from "./LoginPage";

// --- Variables hoistées (disponibles avant les appels vi.mock hoistés) ---

const { mockAuthenticate, mockAuthState, mockEnv, mockTheme } = vi.hoisted(() => {
  const authenticate = vi.fn();

  const authState = {
    user: undefined as undefined,
    loading: false,
    error: null as string | null,
    authenticate,
    signOut: vi.fn(),
    setUser: vi.fn(),
    token: undefined as undefined,
    impersonate: undefined as undefined,
    setImpersonate: vi.fn(),
    removeImpersonate: vi.fn(),
    isExpired: vi.fn(() => false),
  };

  const envState = {
    REACT_APP_ETABLISSEMENT: "Université de Bordeaux",
    REACT_APP_ETABLISSEMENT_ARTICLE: "l'Université de Bordeaux",
    REACT_APP_ETABLISSEMENT_URL: "https://u-bordeaux.fr",
    REACT_APP_TITRE: "Oasis",
    REACT_APP_SERVICE: "Aide aux étudiants",
    REACT_APP_EMAIL_SERVICE: "oasis@u-bordeaux.fr",
    REACT_APP_LOGO: null as string | null,
    REACT_APP_LOGO_DARK: null as string | null,
    REACT_APP_INFOS_AUTH: null as string | null,
    REACT_APP_MSG_ACCUEIL: null as string | null,
  };

  const theme = vi.fn(() => "light" as "light" | "dark");

  return {
    mockAuthenticate: authenticate,
    mockAuthState: authState,
    mockEnv: envState,
    mockTheme: theme,
  };
});

// --- Mocks ---

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@/env", () => ({ env: mockEnv }));

vi.mock("@utils/TypedText/useTypedText", () => ({
  useTypedText: () => ({
    text: "Université de Bordeaux",
    fading: false,
    showCursor: false,
    hideCursor: false,
  }),
}));

vi.mock("@controls/Images/HomepageImage", () => ({
  default: () => <div data-testid="homepage-image" aria-hidden="true" />,
}));

vi.mock("@utils/PageTitle/PageTitle", () => ({
  default: () => null,
}));

vi.mock("@utils/theme/useEffectiveTheme", () => ({
  useEffectiveTheme: mockTheme,
}));

// --- Tests ---

describe("LoginPage", () => {
  beforeEach(() => {
    mockAuthState.loading = false;
    mockAuthState.error = null;
    mockEnv.REACT_APP_LOGO = null;
    mockEnv.REACT_APP_LOGO_DARK = null;
    mockEnv.REACT_APP_INFOS_AUTH = null;
    mockAuthenticate.mockClear();
    mockTheme.mockReturnValue("light");
  });

  describe("rendu de base", () => {
    it("affiche le bouton de connexion", () => {
      render(<LoginPage />);
      expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
    });

    it("affiche le texte informatif sur les identifiants", () => {
      render(<LoginPage />);
      expect(screen.getByText(/identifiants fournis par/i)).toBeInTheDocument();
    });

    it("affiche le lien vers la politique RGPD", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("link", { name: /politique d'utilisation des données/i }),
      ).toBeInTheDocument();
    });

    it("affiche le lien vers les mentions légales", () => {
      render(<LoginPage />);
      expect(screen.getByRole("link", { name: /mentions légales/i })).toBeInTheDocument();
    });

    it("affiche le lien de contact du service dans le footer", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("link", { name: /le service aide aux étudiants/i }),
      ).toBeInTheDocument();
    });

    it("le lien email du footer pointe sur la bonne adresse mailto", () => {
      render(<LoginPage />);
      expect(screen.getByRole("link", { name: /le service aide aux étudiants/i })).toHaveAttribute(
        "href",
        "mailto:oasis@u-bordeaux.fr",
      );
    });
  });

  describe("état de chargement", () => {
    it("affiche l'indicateur de chargement sur le bouton en état loading", () => {
      mockAuthState.loading = true;
      render(<LoginPage />);
      // Ant Design Button avec loading={true} ajoute la classe ant-btn-loading
      expect(screen.getByRole("button", { name: /se connecter/i })).toHaveClass("ant-btn-loading");
    });

    it("n'affiche pas l'indicateur de chargement par défaut", () => {
      render(<LoginPage />);
      expect(screen.getByRole("button", { name: /se connecter/i })).not.toHaveClass(
        "ant-btn-loading",
      );
    });
  });

  describe("gestion des erreurs", () => {
    it("affiche une alerte quand auth.error est défini", () => {
      mockAuthState.error = "Erreur d'authentification (401)";
      render(<LoginPage />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Erreur d'authentification (401)")).toBeInTheDocument();
    });

    it("n'affiche pas d'alerte sans erreur", () => {
      render(<LoginPage />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("appelle auth.authenticate au clic sur le bouton de connexion", async () => {
      render(<LoginPage />);
      await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));
      expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    });
  });

  describe("affichage conditionnel", () => {
    it("n'affiche pas de lien établissement sans logo", () => {
      render(<LoginPage />);
      expect(screen.queryByRole("link", { name: /visiter le site de/i })).not.toBeInTheDocument();
    });

    it("affiche au moins un lien établissement quand REACT_APP_LOGO est défini", () => {
      mockEnv.REACT_APP_LOGO = "https://example.com/logo.png";
      render(<LoginPage />);
      const establishmentLinks = screen.getAllByRole("link", { name: /visiter le site de/i });
      expect(establishmentLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("affiche le lien 'En savoir plus' quand REACT_APP_INFOS_AUTH est défini", () => {
      mockEnv.REACT_APP_INFOS_AUTH = "https://example.com/auth-info";
      render(<LoginPage />);
      expect(screen.getByRole("link", { name: /en savoir plus/i })).toBeInTheDocument();
    });

    it("n'affiche pas le lien 'En savoir plus' sans REACT_APP_INFOS_AUTH", () => {
      render(<LoginPage />);
      expect(screen.queryByRole("link", { name: /en savoir plus/i })).not.toBeInTheDocument();
    });

    it("affiche le logo dark quand le thème est sombre et REACT_APP_LOGO_DARK est défini", () => {
      mockTheme.mockReturnValue("dark");
      mockEnv.REACT_APP_LOGO = "https://example.com/logo.png";
      mockEnv.REACT_APP_LOGO_DARK = "https://example.com/logo-dark.png";
      render(<LoginPage />);
      expect(document.querySelectorAll("img")[0]).toHaveAttribute(
        "src",
        "https://example.com/logo-dark.png",
      );
    });

    it("utilise le logo clair en dark mode quand REACT_APP_LOGO_DARK n'est pas défini", () => {
      mockTheme.mockReturnValue("dark");
      mockEnv.REACT_APP_LOGO = "https://example.com/logo.png";
      render(<LoginPage />);
      expect(document.querySelectorAll("img")[0]).toHaveAttribute(
        "src",
        "https://example.com/logo.png",
      );
    });
  });

  describe("accessibilité (axe-core)", () => {
    it("n'a pas de violations sur la page par défaut", async () => {
      const { container } = render(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("n'a pas de violations en état d'erreur", async () => {
      mockAuthState.error = "Erreur de connexion";
      const { container } = render(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("n'a pas de violations quand le logo est affiché", async () => {
      mockEnv.REACT_APP_LOGO = "https://example.com/logo.png";
      const { container } = render(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("le h1 a un aria-label complet indépendamment du texte animé", () => {
      render(<LoginPage />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
        "aria-label",
        "Université de Bordeaux : Oasis",
      );
    });

    it("le bouton de connexion a un aria-label explicite", () => {
      render(<LoginPage />);
      expect(
        screen.getByRole("button", { name: "Se connecter à l'application" }),
      ).toBeInTheDocument();
    });
  });
});
