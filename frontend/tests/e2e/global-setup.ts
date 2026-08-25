import { E2E_API_URL, E2E_BASE_URL } from "./env";

/**
 * Verifie que la stack repond avant de lancer la moindre spec.
 *
 * Sans ce controle, une stack arretee produit une cascade d'echecs opaques
 * dans lesquels il faut fouiller pour comprendre que rien n'ecoutait.
 */
async function verifier(nom: string, url: string): Promise<void> {
   try {
      const reponse = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (reponse.status >= 500) {
         throw new Error(`réponse ${reponse.status}`);
      }
   } catch (cause) {
      throw new Error(
         `${nom} ne répond pas sur ${url}. Démarrer la stack (voir installation/), puis charger ` +
            "les données de test avec hautelook:fixtures:load. Les URL se surchargent avec " +
            "E2E_BASE_URL et E2E_API_URL, et le nom du conteneur avec E2E_BACKEND_CONTAINER. " +
            `Cause : ${cause instanceof Error ? cause.message : String(cause)}`,
      );
   }
}

export default async function globalSetup(): Promise<void> {
   await verifier("Le frontend", E2E_BASE_URL);
   await verifier("L'API", E2E_API_URL);
}
