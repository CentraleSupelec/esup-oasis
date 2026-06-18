/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppConfigProvider } from "./AppConfigProvider";

const mockAccessibilite = { contrast: false };
vi.mock("@context/accessibilite/AccessibiliteContext", () => ({
  useAccessibilite: () => ({ accessibilite: mockAccessibilite }),
}));
vi.mock("@utils/theme/useEffectiveTheme", () => ({ useEffectiveTheme: () => "light" }));

const { buildCssVars, buildTheme } = vi.hoisted(() => ({
  buildCssVars: vi.fn(() => ({ "--couleur-test": "#abcdef" })),
  buildTheme: vi.fn(() => ({ token: {} })),
}));
vi.mock("@/themeBuilder", () => ({ buildCssVars, buildTheme }));

describe("AppConfigProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.style.removeProperty("--couleur-test");
    mockAccessibilite.contrast = false;
  });

  it("rend ses enfants dans le ConfigProvider antd", () => {
    render(
      <AppConfigProvider>
        <span>contenu applicatif</span>
      </AppConfigProvider>,
    );
    expect(screen.getByText("contenu applicatif")).toBeInTheDocument();
  });

  it("applique les variables CSS calculées sur :root au montage", () => {
    render(
      <AppConfigProvider>
        <span>x</span>
      </AppConfigProvider>,
    );
    expect(buildCssVars).toHaveBeenCalledWith(false, "light");
    expect(document.documentElement.style.getPropertyValue("--couleur-test")).toBe("#abcdef");
  });

  it("construit le thème antd à partir du mode effectif et de l'accessibilité", () => {
    render(
      <AppConfigProvider>
        <span>x</span>
      </AppConfigProvider>,
    );
    expect(buildTheme).toHaveBeenCalledWith("light", mockAccessibilite);
  });

  it("propage le mode contraste aux variables CSS", () => {
    mockAccessibilite.contrast = true;
    render(
      <AppConfigProvider>
        <span>x</span>
      </AppConfigProvider>,
    );
    expect(buildCssVars).toHaveBeenCalledWith(true, "light");
  });
});
