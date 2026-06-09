/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  getColor,
  getContrastColor,
  MaterialColorAmount,
  MATERIAL_COLORS_NAMES,
  pSBC,
} from "./colors";

// ---------------------------------------------------------------------------
// getColor
// ---------------------------------------------------------------------------

describe("getColor", () => {
  it("retourne la valeur hexadécimale correcte pour red-500", () => {
    expect(getColor("red", MaterialColorAmount.c5)).toBe("#f44336");
  });

  it("retourne la valeur correcte pour blue-200", () => {
    expect(getColor("blue", MaterialColorAmount.c2)).toBe("#90caf9");
  });

  it("retourne la valeur correcte pour green-900", () => {
    expect(getColor("green", MaterialColorAmount.c9)).toBe("#1b5e20");
  });
});

// ---------------------------------------------------------------------------
// MATERIAL_COLORS_NAMES
// ---------------------------------------------------------------------------

describe("MATERIAL_COLORS_NAMES", () => {
  it("contient au moins les couleurs de base", () => {
    expect(MATERIAL_COLORS_NAMES).toContain("red");
    expect(MATERIAL_COLORS_NAMES).toContain("blue");
    expect(MATERIAL_COLORS_NAMES).toContain("green");
  });

  it("ne contient pas de doublons", () => {
    expect(new Set(MATERIAL_COLORS_NAMES).size).toBe(MATERIAL_COLORS_NAMES.length);
  });
});

// ---------------------------------------------------------------------------
// getContrastColor — critique accessibilité WCAG
// ---------------------------------------------------------------------------

describe("getContrastColor", () => {
  it("retourne noir (#000000) pour une couleur claire (blanc)", () => {
    expect(getContrastColor("#FFFFFF")).toBe("#000000");
  });

  it("retourne blanc (#FFFFFF) pour une couleur sombre (noir)", () => {
    expect(getContrastColor("#000000")).toBe("#FFFFFF");
  });

  it("retourne noir pour le jaune (couleur très claire)", () => {
    expect(getContrastColor("#FFFF00")).toBe("#000000");
  });

  it("retourne blanc pour un bleu foncé", () => {
    expect(getContrastColor("#0d47a1")).toBe("#FFFFFF");
  });

  it("retourne blanc pour un rouge foncé", () => {
    expect(getContrastColor("#b71c1c")).toBe("#FFFFFF");
  });

  it("accepte un format court à 3 chiffres (#FFF)", () => {
    expect(getContrastColor("#FFF")).toBe("#000000");
  });

  it("accepte une couleur sans dièse", () => {
    expect(getContrastColor("FFFFFF")).toBe("#000000");
  });
});

// ---------------------------------------------------------------------------
// pSBC — assombrissement / éclaircissement
// ---------------------------------------------------------------------------

describe("pSBC", () => {
  it("retourne null pour un paramètre p > 1", () => {
    expect(pSBC(2, "#ff0000")).toBeNull();
  });

  it("retourne null pour un paramètre p < -1", () => {
    expect(pSBC(-2, "#ff0000")).toBeNull();
  });

  it("retourne null pour une couleur source invalide", () => {
    expect(pSBC(0.5, "not-a-color")).toBeNull();
  });

  it("assombrit une couleur (p négatif) : la composante R diminue", () => {
    const result = pSBC(-0.5, "#ff0000");
    expect(result).not.toBeNull();
    const r = parseInt((result as string).slice(1, 3), 16);
    expect(r).toBeLessThan(255);
  });

  it("éclaircit une couleur (p positif) : la composante R reste à 255 (déjà max)", () => {
    // #ff0000 a R = 255 (max), l'éclaircissement ne peut qu'augmenter G et B
    const result = pSBC(0.5, "#ff0000");
    expect(result).not.toBeNull();
    const g = parseInt((result as string).slice(3, 5), 16);
    expect(g).toBeGreaterThan(0);
  });

  it("p = 0 retourne une couleur équivalente à la couleur source", () => {
    const result = pSBC(0, "#ff0000");
    expect(result).not.toBeNull();
    const r = parseInt((result as string).slice(1, 3), 16);
    expect(r).toBe(255);
  });
});
