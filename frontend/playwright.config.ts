import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL, E2E_IS_CI, E2E_SLOW_MO } from "./tests/e2e/env";

/**
 * Configuration Playwright des tests de bout en bout.
 *
 * Les tests s'executent contre une stack applicative deja demarree (docker
 * compose ou serveur de dev lance a part). Playwright ne demarre donc aucun
 * serveur : il n'y a volontairement pas de bloc webServer. Les URL sont
 * surchargeables par variables d'environnement pour s'adapter aux ports de
 * chaque installation.
 */
export default defineConfig({
   testDir: "./tests/e2e",
   globalSetup: "./tests/e2e/global-setup.ts",
   outputDir: "./test-results",
   // Ces tests partagent une meme base de donnees et modifient l'etat du dossier
   // (observations, date d'avis medical, amenagements). Ils doivent donc se
   // derouler en serie, sans quoi ils se perturbent mutuellement.
   fullyParallel: false,
   forbidOnly: E2E_IS_CI,
   retries: E2E_IS_CI ? 1 : 0,
   workers: 1,
   timeout: 60_000,
   expect: { timeout: 10_000 },
   reporter: E2E_IS_CI
      ? [["line"], ["html", { open: "never" }]]
      : [["list"], ["html", { open: "never" }]],
   use: {
      baseURL: E2E_BASE_URL,
      locale: "fr-FR",
      timezoneId: "Europe/Paris",
      actionTimeout: 15_000,
      navigationTimeout: 30_000,
      // Artefacts conserves uniquement quand un test echoue.
      trace: "retain-on-failure",
      screenshot: "only-on-failure",
      video: "retain-on-failure",
      launchOptions: { slowMo: E2E_SLOW_MO },
   },
   projects: [
      {
         name: "chromium",
         use: { ...devices["Desktop Chrome"] },
      },
   ],
});
