/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import OAuthCallback from "./OAuthCallback";
import { OAUTH_CALLBACK_PAYLOAD_KEY, OAUTH_STATE_KEY } from "@/auth/hook/constants";

vi.mock("@controls/Spinner/Spinner", () => ({
  default: () => <div data-testid="spinner" role="status" aria-label="Chargement en cours" />,
}));

// --- Helpers ---

function buildHash(params: Record<string, string>): string {
  return `#${new URLSearchParams(params).toString()}`;
}

function getStoredPayload(): { payload?: Record<string, string>; error?: string } | null {
  const raw = sessionStorage.getItem(OAUTH_CALLBACK_PAYLOAD_KEY);
  return raw ? (JSON.parse(raw) as { payload?: Record<string, string>; error?: string }) : null;
}

// --- Tests ---

describe("OAuthCallback", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();

    vi.stubGlobal("location", {
      hash: "",
      origin: "http://localhost",
      replace: replaceMock,
    });
  });

  afterEach(() => {
    try {
      vi.runAllTimers();
    } catch {
      // le test a peut-être déjà restauré les vrais timers (ex : test axe-core)
    }
    vi.useRealTimers();
    vi.unstubAllGlobals();
    replaceMock.mockClear();
  });

  describe("rendu", () => {
    it("rend le spinner par défaut", () => {
      render(<OAuthCallback />);
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("rend le composant custom fourni via la prop Component", () => {
      render(<OAuthCallback Component={<div data-testid="custom-loader">Chargement…</div>} />);
      expect(screen.getByTestId("custom-loader")).toBeInTheDocument();
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  });

  describe("state valide", () => {
    it("stocke le payload en sessionStorage", () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, "state-valide");
      window.location.hash = buildHash({
        access_token: "token-abc",
        state: "state-valide",
        token_type: "bearer",
      });

      render(<OAuthCallback />);
      vi.runAllTimers();

      const stored = getStoredPayload();
      expect(stored?.payload).toMatchObject({
        access_token: "token-abc",
        state: "state-valide",
        token_type: "bearer",
      });
      expect(stored?.error).toBeUndefined();
    });

    it("redirige vers window.location.origin après traitement", () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, "state-valide");
      window.location.hash = buildHash({ access_token: "token-abc", state: "state-valide" });

      render(<OAuthCallback />);
      vi.runAllTimers();

      expect(replaceMock).toHaveBeenCalledWith("http://localhost");
    });
  });

  describe("state invalide (mismatch CSRF)", () => {
    it("stocke une erreur state mismatch si le state reçu ne correspond pas", () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, "state-attendu");
      window.location.hash = buildHash({
        access_token: "token-abc",
        state: "state-pirate",
      });

      render(<OAuthCallback />);
      vi.runAllTimers();

      const stored = getStoredPayload();
      expect(stored?.error).toBe("OAuth error: State mismatch.");
      expect(stored?.payload).toBeUndefined();
    });

    it("redirige quand même en cas de mismatch", () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, "state-attendu");
      window.location.hash = buildHash({ access_token: "token-abc", state: "state-pirate" });

      render(<OAuthCallback />);
      vi.runAllTimers();

      expect(replaceMock).toHaveBeenCalledWith("http://localhost");
    });

    it("stocke une erreur state mismatch si sessionStorage ne contient aucun state", () => {
      window.location.hash = buildHash({ access_token: "token-abc", state: "state-quelconque" });

      render(<OAuthCallback />);
      vi.runAllTimers();

      expect(getStoredPayload()?.error).toBe("OAuth error: State mismatch.");
    });
  });

  describe("erreur OAuth dans le hash", () => {
    it("stocke l'erreur décodée si error est présent dans le hash", () => {
      window.location.hash = buildHash({ error: "access_denied" });

      render(<OAuthCallback />);
      vi.runAllTimers();

      const stored = getStoredPayload();
      expect(stored?.error).toBe("access_denied");
      expect(stored?.payload).toBeUndefined();
    });

    it("décode les caractères URI dans le message d'erreur", () => {
      window.location.hash = buildHash({ error: "access%20denied" });

      render(<OAuthCallback />);
      vi.runAllTimers();

      expect(getStoredPayload()?.error).toBe("access denied");
    });

    it("redirige quand même en cas d'erreur OAuth", () => {
      window.location.hash = buildHash({ error: "access_denied" });

      render(<OAuthCallback />);
      vi.runAllTimers();

      expect(replaceMock).toHaveBeenCalledWith("http://localhost");
    });
  });

  describe("comportement du setTimeout", () => {
    it("n'écrit pas en sessionStorage avant l'expiration du timer", () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, "state-valide");
      window.location.hash = buildHash({ access_token: "tok", state: "state-valide" });

      render(<OAuthCallback />);

      expect(getStoredPayload()).toBeNull();

      vi.runAllTimers();

      expect(getStoredPayload()).not.toBeNull();
    });

    it("ne redirige pas avant l'expiration du timer", () => {
      sessionStorage.setItem(OAUTH_STATE_KEY, "state-valide");
      window.location.hash = buildHash({ access_token: "tok", state: "state-valide" });

      render(<OAuthCallback />);

      expect(replaceMock).not.toHaveBeenCalled();

      vi.runAllTimers();

      expect(replaceMock).toHaveBeenCalled();
    });
  });

  describe("accessibilité (axe-core)", () => {
    it("n'a pas de violations sur le rendu par défaut", async () => {
      const { container } = render(<OAuthCallback />);
      // axe-core utilise des Promises/timers internes — les vrais timers sont requis
      vi.useRealTimers();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
