/*
 * Copyright (c) 2026. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import { execFileSync } from "node:child_process";

import { expect, test, type Locator, type Page } from "@playwright/test";
import { E2E_API_URL, E2E_BACKEND_CONTAINER, E2E_BASE_URL, E2E_JWT_COOKIE_NAME } from "./env";

/**
 * Profil administratif du bénéficiaire.
 *
 * Vérifie de bout en bout les trois informations administratives remontées du
 * système d'information de scolarité et affichées dans l'onglet Identité du
 * dossier d'un bénéficiaire :
 *
 *  1. l'adresse postale, restituée sur plusieurs lignes ;
 *  2. la situation sociale, affichée uniquement lorsqu'une situation est
 *     connue et différente de "non boursier" ;
 *  3. le statut d'inscription administrative, calculé à partir des
 *     inscriptions et valant "En cours" dès qu'une inscription couvre la date
 *     du jour.
 *
 * Ces trois champs sont exposés par l'API sous garde ROLE_PLANIFICATEUR ou
 * consultation de son propre dossier. Le scénario se connecte donc avec un
 * compte gestionnaire, qui porte à la fois ROLE_PLANIFICATEUR (lecture des
 * champs) et ROLE_GESTIONNAIRE (accès à la page dossier).
 *
 * Données : jeu de fixtures de test du backend, à charger avant exécution.
 */

/** Compte utilisé pour consulter les dossiers. */
const UID_OPERATEUR = "gestionnaire";

/**
 * Bénéficiaire de référence : adresse postale complète, situation sociale
 * boursier, et une inscription dont la période couvre la date du jour.
 */
const UID_DOSSIER_RENSEIGNE = "etudiant-dossier-administratif";

/**
 * Bénéficiaire de contrôle : inscrit lui aussi, mais sans situation sociale
 * connue. Sert à vérifier que la ligne correspondante disparaît au lieu
 * d'afficher une valeur vide.
 */
const UID_SANS_SITUATION_SOCIALE = "etudiant-parcours-academique";

/** Adresse postale attendue pour le dossier de référence. */
const ADRESSE_ATTENDUE = {
  ligne1: "12 rue des Lilas",
  codePostal: "33000",
  ville: "Bordeaux",
  pays: "FRANCE",
} as const;

/**
 * Rappel affiché dans les messages d'erreur. Le nom du conteneur est
 * paramétrable, l'installation de référence du dépôt en fournit la valeur par
 * défaut.
 */
const RAPPEL_FIXTURES =
  "Charger au préalable les données de test : " +
  `docker exec -i ${E2E_BACKEND_CONTAINER} php bin/console hautelook:fixtures:load --no-interaction`;

/**
 * Signe un jeton pour l'identifiant donné, via la console du backend. C'est le
 * seul moyen de s'authentifier sans dérouler le parcours du fournisseur
 * d'identité externe, qui n'est pas disponible en test.
 */
function genererJeton(uid: string): string {
  const sortie = execFileSync(
    "docker",
    [
      "exec",
      E2E_BACKEND_CONTAINER,
      "php",
      "/app/bin/console",
      "lexik:jwt:generate-token",
      uid,
      "--user-class=App\\Entity\\Utilisateur",
      "--no-debug",
      "--no-ansi",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  const jeton = sortie
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .find((ligne) => ligne.startsWith("ey"));

  if (!jeton) {
    throw new Error(
      `Génération du jeton impossible pour "${uid}". ` +
        `Vérifier que le conteneur "${E2E_BACKEND_CONTAINER}" est démarré ` +
        `(variable E2E_BACKEND_CONTAINER). ${RAPPEL_FIXTURES}`,
    );
  }

  return jeton;
}

/**
 * Installe une session authentifiée : le cookie portant le jeton côté API, et le
 * marqueur de reconnexion côté navigateur, que l'application relit au démarrage
 * pour savoir quel utilisateur recharger (le cookie étant HttpOnly).
 */
async function ouvrirSession(page: Page, uid: string): Promise<void> {
  await page.context().addCookies([
    {
      name: E2E_JWT_COOKIE_NAME,
      value: genererJeton(uid),
      url: E2E_API_URL,
      httpOnly: true,
      secure: E2E_API_URL.startsWith("https://"),
      sameSite: "Lax",
    },
  ]);

  await page.addInitScript((login: string) => {
    window.localStorage.setItem("login", JSON.stringify(login));
  }, uid);
}

/** Lit la représentation API d'un utilisateur avec la session courante. */
async function lireUtilisateur(page: Page, uid: string): Promise<Record<string, unknown>> {
  const reponse = await page.context().request.get(`${E2E_API_URL}/utilisateurs/${uid}`, {
    headers: { Accept: "application/ld+json" },
  });

  expect(
    reponse.status(),
    `L'utilisateur de référence "${uid}" doit être lisible. ${RAPPEL_FIXTURES}`,
  ).toBe(200);

  return (await reponse.json()) as Record<string, unknown>;
}

/**
 * Cible la valeur affichée en regard d'un libellé du dossier.
 *
 * Les blocs de description du dossier sont rendus en mode bordé : chaque ligne
 * du tableau porte le libellé dans une cellule d'en-tête suivie de la valeur
 * dans la cellule voisine.
 */
function valeurEnRegardDe(page: Page, libelle: RegExp): Locator {
  return page.locator("th").filter({ hasText: libelle }).locator("xpath=following-sibling::td[1]");
}

/** Ouvre le dossier d'un bénéficiaire et attend l'affichage de l'onglet Identité. */
async function ouvrirDossier(page: Page, uid: string): Promise<void> {
  await page.goto(`${E2E_BASE_URL}/beneficiaires/${uid}`);

  const ongletIdentite = page.getByRole("tab", { name: /Identité/ });
  await expect(
    ongletIdentite,
    "Le dossier du bénéficiaire doit s'ouvrir sur l'onglet Identité. " +
      "Une redirection vers l'écran de connexion signale une session non prise en compte.",
  ).toBeVisible({ timeout: 30_000 });
  await ongletIdentite.click();
}

test.describe("Profil administratif du bénéficiaire", () => {
  test.beforeAll(async ({ request }) => {
    let statut: number;
    try {
      const reponse = await request.get(`${E2E_API_URL}/utilisateurs/${UID_DOSSIER_RENSEIGNE}`);
      statut = reponse.status();
    } catch (erreur) {
      const detail = erreur instanceof Error ? erreur.message : String(erreur);
      throw new Error(
        `API injoignable sur ${E2E_API_URL} (${detail}). Démarrer la pile applicative, ` +
          "ou surcharger E2E_API_URL et E2E_BASE_URL si les ports diffèrent.",
      );
    }

    // Sans session ouverte, l'API refuse la lecture : seule la connectivité
    // est vérifiée ici, une erreur serveur indiquerait une pile inutilisable.
    expect(
      statut,
      `L'API répond ${statut} sur ${E2E_API_URL}, la pile n'est pas saine.`,
    ).toBeLessThan(500);
  });

  test("expose l'adresse, la situation sociale et le statut d'inscription dans la représentation API", async ({
    page,
  }) => {
    await ouvrirSession(page, UID_OPERATEUR);

    const utilisateur = await lireUtilisateur(page, UID_DOSSIER_RENSEIGNE);

    // Situation sociale : le code et son libellé proviennent du référentiel de
    // scolarité, l'indicateur booléen en est dérivé.
    expect(utilisateur.codeSituationSociale).toBe("BO");
    expect(utilisateur.libelleSituationSociale).toBe("Boursier");
    expect(utilisateur.boursier).toBe(true);

    // Statut d'inscription administrative : une inscription couvre la date du
    // jour, le statut calculé vaut donc EN_COURS.
    expect(utilisateur.statutInscriptionAdministrative).toBe("EN_COURS");

    // Adresse postale : restituée champ par champ.
    const adresse = utilisateur.adresse as Record<string, unknown> | null;
    expect(adresse, "L'adresse postale doit être exposée.").not.toBeNull();
    expect(adresse?.ligne1).toBe(ADRESSE_ATTENDUE.ligne1);
    expect(adresse?.codePostal).toBe(ADRESSE_ATTENDUE.codePostal);
    expect(adresse?.ville).toBe(ADRESSE_ATTENDUE.ville);
    expect(adresse?.pays).toBe(ADRESSE_ATTENDUE.pays);
  });

  test("affiche l'adresse, la mention boursier et l'inscription en cours dans l'onglet Identité", async ({
    page,
  }, testInfo) => {
    await ouvrirSession(page, UID_OPERATEUR);
    await ouvrirDossier(page, UID_DOSSIER_RENSEIGNE);

    // Adresse postale : les quatre éléments sont concaténés sur plusieurs
    // lignes, code postal et ville partageant la même ligne.
    const adresse = valeurEnRegardDe(page, /^Adresse postale$/);
    await expect(adresse).toBeVisible({ timeout: 30_000 });
    await expect(adresse).toContainText(ADRESSE_ATTENDUE.ligne1);
    await expect(adresse).toContainText(`${ADRESSE_ATTENDUE.codePostal} ${ADRESSE_ATTENDUE.ville}`);
    await expect(adresse).toContainText(ADRESSE_ATTENDUE.pays);

    // Situation sociale : le libellé du référentiel est affiché tel quel.
    const situationSociale = valeurEnRegardDe(page, /^Situation sociale$/);
    await expect(situationSociale).toBeVisible();
    await expect(situationSociale).toHaveText("Boursier");

    // Inscription administrative : le statut technique EN_COURS est traduit en
    // libellé lisible.
    const inscriptionAdministrative = valeurEnRegardDe(page, /^Inscription administrative$/);
    await expect(inscriptionAdministrative).toBeVisible();
    await expect(inscriptionAdministrative).toHaveText("En cours");

    // Capture jointe au rapport, écrite dans le répertoire de sortie de
    // Playwright pour rester indépendante de la machine d'exécution.
    const capture = testInfo.outputPath("profil-administratif.png");
    await page.screenshot({ path: capture, fullPage: true });
    await testInfo.attach("Onglet Identité du dossier", {
      path: capture,
      contentType: "image/png",
    });
  });

  test("masque la ligne Situation sociale lorsque aucune situation n'est connue", async ({
    page,
  }) => {
    await ouvrirSession(page, UID_OPERATEUR);

    const utilisateur = await lireUtilisateur(page, UID_SANS_SITUATION_SOCIALE);
    expect(
      utilisateur.codeSituationSociale ?? null,
      "Le dossier de contrôle doit rester dépourvu de situation sociale.",
    ).toBeNull();

    await ouvrirDossier(page, UID_SANS_SITUATION_SOCIALE);

    // Point d'ancrage : le bloc Scolarité est bien rendu pour ce dossier.
    const inscriptionAdministrative = valeurEnRegardDe(page, /^Inscription administrative$/);
    await expect(inscriptionAdministrative).toBeVisible({ timeout: 30_000 });
    await expect(inscriptionAdministrative).toHaveText("En cours");

    // La ligne entière disparaît, plutôt que d'afficher une valeur vide.
    await expect(page.locator("th").filter({ hasText: /^Situation sociale$/ })).toHaveCount(0);
  });
});
