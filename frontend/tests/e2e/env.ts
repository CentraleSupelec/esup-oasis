/**
 * Configuration des tests de bout en bout.
 *
 * Les tests ciblent une stack docker deja demarree (voir installation/compose.yaml).
 * Toutes les valeurs ont un defaut aligne sur l'installation par defaut du projet
 * et restent surchargeables par variable d'environnement, afin que chaque
 * etablissement puisse adapter ports et noms de conteneurs sans toucher au code.
 */

/** URL du frontend. Defaut de FRONTEND_PORT dans installation/compose.yaml. */
export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost";

/** URL de l'API. Defaut de BACKEND_PORT dans installation/compose.yaml. */
export const E2E_API_URL = process.env.E2E_API_URL ?? "http://localhost:8000";

/**
 * Nom du conteneur backend, utilise pour generer un jeton de session via la
 * console Symfony. Correspond au service backend de installation/compose.yaml.
 */
export const E2E_BACKEND_CONTAINER = process.env.E2E_BACKEND_CONTAINER ?? "oasis-backend";

/** Nom du cookie portant le jeton, aligne sur JWT_COOKIE_NAME. */
export const E2E_JWT_COOKIE_NAME = process.env.E2E_JWT_COOKIE_NAME ?? "oasis-token";

/** Execution en integration continue. */
export const E2E_IS_CI = !!process.env.CI;

/** Ralentissement des actions, utile pour observer un test en mode visible. */
export const E2E_SLOW_MO = process.env.E2E_SLOW_MO ? Number(process.env.E2E_SLOW_MO) : 0;
