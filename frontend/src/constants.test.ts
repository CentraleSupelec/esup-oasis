/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { describe, it, expect, afterEach } from "vitest";

// `constants.ts` calcule ses valeurs au chargement à partir de `@/env`.
// On recharge le module avec un env contrôlé pour tester défauts et lecture.
async function importConstants(envOverrides: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("@/env", () => ({ env: envOverrides }));
  return import("@/constants");
}

describe("constants — config dérivée de l'environnement", () => {
  afterEach(() => {
    vi.doUnmock("@/env");
    vi.resetModules();
  });

  it("MAX_FILE_SIZE : 10 Mo par défaut si la variable est absente", async () => {
    const { MAX_FILE_SIZE } = await importConstants({ REACT_APP_MAX_FILE_SIZE: null });
    expect(MAX_FILE_SIZE).toBe(10);
  });

  it("MAX_FILE_SIZE : 10 Mo si la variable est invalide ou ≤ 0", async () => {
    const { MAX_FILE_SIZE } = await importConstants({ REACT_APP_MAX_FILE_SIZE: "0" });
    expect(MAX_FILE_SIZE).toBe(10);
  });

  it("MAX_FILE_SIZE : reprend la valeur configurée si > 0", async () => {
    const { MAX_FILE_SIZE } = await importConstants({ REACT_APP_MAX_FILE_SIZE: "25" });
    expect(MAX_FILE_SIZE).toBe(25);
  });

  it("couleurs : applique les valeurs de repli quand les variables sont absentes", async () => {
    const mod = await importConstants({});
    expect(mod.APP_SECONDARY_COLOR).toBe("#ffe082");
    expect(mod.APP_ERROR_COLOR).toBe("#ff4d4f");
    expect(mod.APP_WARNING_COLOR).toBe("#EF7D03");
    expect(mod.APP_SUCCESS_COLOR).toBe("#52c41a");
  });

  it("couleurs : lit la couleur primaire fournie par la configuration", async () => {
    const { APP_PRIMARY_COLOR } = await importConstants({ REACT_APP_PRIMARY_COLOR: "#123456" });
    expect(APP_PRIMARY_COLOR).toBe("#123456");
  });

  it("constantes statiques : valeurs stables indépendantes de l'environnement", async () => {
    const mod = await importConstants({});
    expect(mod.NB_MAX_ITEMS_PER_PAGE).toBe(9999);
    expect(mod.TYPE_EVENEMENT_RENFORT).toBe("/types_evenements/-1");
    expect(mod.BENEFICIAIRE_PROFIL_A_DETERMINER).toBe("/profils/-1");
  });
});
