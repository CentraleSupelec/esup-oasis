import { execFileSync } from "node:child_process";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { E2E_API_URL, E2E_BACKEND_CONTAINER, E2E_BASE_URL, E2E_JWT_COOKIE_NAME } from "./env";

/**
 * Profil académique du bénéficiaire : niveau d'études, redoublement et cursus aménagé.
 *
 * Ce que la spec valide, sur un dossier de référence portant quatre inscriptions
 * consécutives (L1, L2, L3, M1) :
 *
 *  1. l'API dérive correctement les trois informations non persistées :
 *     le niveau d'études, le redoublement (compteur d'inscriptions à l'étape
 *     supérieur à 1) et le cursus aménagé (code et libellé issus du SI scolarité) ;
 *  2. la fiche bénéficiaire restitue ces informations sous forme d'étiquettes,
 *     une par inscription, et n'en affiche aucune lorsque le cas ne s'applique pas ;
 *  3. le cursus aménagé neutralise le calcul du redoublement : une inscription
 *     comptée plusieurs fois mais couverte par un cursus aménagé n'est pas
 *     signalée comme un redoublement ;
 *  4. l'infobulle de l'étiquette Cursus aménagé restitue le libellé complet ;
 *  5. les inscriptions sont présentées de la plus récente à la plus ancienne.
 *
 * Prérequis d'exécution :
 *  - la pile applicative est démarrée (frontend et backend) ;
 *  - les fixtures de test du backend sont chargées, ce qui crée le dossier de
 *    référence utilisé ici :
 *      docker exec "${E2E_BACKEND_CONTAINER:-oasis-backend}" \
 *        php /app/bin/console hautelook:fixtures:load --no-interaction
 *
 * Toutes les URL, le nom du conteneur backend et le nom du cookie JWT sont
 * paramétrables par variable d'environnement (voir tests/e2e/env.ts).
 */

/** Compte utilisé pour consulter le dossier : il porte le rôle gestionnaire. */
const UID_CONSULTANT = "gestionnaire";

/** Dossier de référence portant les quatre inscriptions. */
const UID_BENEFICIAIRE = "etudiant-parcours-academique";

/** Un cas fonctionnel du parcours de référence, décrit une seule fois pour l'API et pour l'interface. */
interface CasInscription {
  /** Intitulé fonctionnel du cas, repris dans les messages d'échec. */
  readonly cas: string;
  readonly libelleFormation: string;
  readonly codeEtape: string;
  readonly niveau: string;
  readonly redoublant: boolean;
  readonly codeCursusAmenage: string | null;
  readonly libelleCursusAmenage: string | null;
}

/** Parcours de référence, de la plus ancienne inscription à la plus récente. */
const PARCOURS: readonly CasInscription[] = [
  {
    cas: "cas nominal, ni redoublement ni cursus aménagé",
    libelleFormation: "Licence 1 informatique",
    codeEtape: "L1INFO",
    niveau: "L1",
    redoublant: false,
    codeCursusAmenage: null,
    libelleCursusAmenage: null,
  },
  {
    cas: "redoublement, étape suivie plusieurs fois hors cursus aménagé",
    libelleFormation: "Licence 2 informatique",
    codeEtape: "L2INFO",
    niveau: "L2",
    redoublant: true,
    codeCursusAmenage: null,
    libelleCursusAmenage: null,
  },
  {
    cas: "cursus aménagé, qui neutralise le calcul du redoublement",
    libelleFormation: "Licence 3 informatique",
    codeEtape: "L3INFO",
    niveau: "L3",
    redoublant: false,
    codeCursusAmenage: "ETA",
    libelleCursusAmenage: "Étalement de la formation",
  },
  {
    cas: "second cursus aménagé, code et libellé distincts",
    libelleFormation: "Master 1 informatique",
    codeEtape: "M1INFO",
    niveau: "M1",
    redoublant: false,
    codeCursusAmenage: "CPA",
    libelleCursusAmenage: "Contrat pédagogique aménagé",
  },
];

/** Projection JSON d'une inscription telle que l'API l'expose sur la fiche utilisateur. */
interface InscriptionApi {
  readonly codeEtape?: string;
  readonly niveau?: string | null;
  readonly redoublant?: boolean;
  readonly codeCursusAmenage?: string | null;
  readonly libelleCursusAmenage?: string | null;
  readonly formation?: { readonly libelle?: string };
}

interface DossierApi {
  readonly inscriptions?: readonly InscriptionApi[];
}

/**
 * Génère un jeton JWT applicatif pour l'identifiant demandé, via la commande
 * console du backend. C'est le seul moyen de s'authentifier sans dérouler le
 * parcours du fournisseur d'identité externe, qui n'est pas disponible en test.
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
        `(variable E2E_BACKEND_CONTAINER). Sortie obtenue : ${sortie.trim()}`,
    );
  }

  return jeton;
}

/**
 * Installe une session authentifiée : le cookie JWT côté API, et le marqueur de
 * reconnexion côté navigateur, que l'application relit au démarrage pour savoir
 * quel utilisateur recharger (le cookie étant HttpOnly, elle ne peut pas le lire).
 */
async function authentifier(page: Page, uid: string): Promise<void> {
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

/** Ouvre la fiche bénéficiaire et positionne l'onglet Identité, qui porte la scolarité. */
async function ouvrirFicheBeneficiaire(page: Page): Promise<void> {
  await page.goto(`${E2E_BASE_URL}/beneficiaires/${UID_BENEFICIAIRE}`);
  await expect(page.getByRole("heading", { level: 1, name: "Bénéficiaire" })).toBeVisible();
  await page.getByRole("tab", { name: "Identité" }).click();
  await expect(page.getByRole("heading", { name: "Scolarité" })).toBeVisible();
}

/** Carte d'inscription, identifiée par l'intitulé de sa formation. */
function carteInscription(page: Page, libelleFormation: string): Locator {
  return page.locator(".ant-card").filter({ hasText: libelleFormation });
}

/** Étiquette d'une carte d'inscription, ciblée sur son libellé exact. */
function etiquette(carte: Locator, libelle: string): Locator {
  return carte.locator(".ant-tag").filter({ hasText: new RegExp(`^${libelle}$`) });
}

test.describe("Profil académique du bénéficiaire", () => {
  test.setTimeout(60_000);

  test("l'API dérive le niveau, le redoublement et le cursus aménagé de chaque inscription", async () => {
    const reponse = await fetch(`${E2E_API_URL}/utilisateurs/${UID_BENEFICIAIRE}`, {
      headers: {
        Accept: "application/ld+json",
        Authorization: `Bearer ${genererJeton(UID_CONSULTANT)}`,
      },
    });
    expect(reponse.status, "la fiche du bénéficiaire de référence doit être lisible").toBe(200);

    const dossier = (await reponse.json()) as DossierApi;
    const inscriptions = dossier.inscriptions ?? [];
    expect(inscriptions).toHaveLength(PARCOURS.length);

    const parEtape = new Map(inscriptions.map((i) => [i.codeEtape, i]));

    for (const attendu of PARCOURS) {
      const inscription = parEtape.get(attendu.codeEtape);
      expect(inscription, `inscription ${attendu.codeEtape} absente de la fiche`).toBeDefined();
      expect(inscription?.formation?.libelle).toBe(attendu.libelleFormation);
      expect(inscription?.niveau, `niveau du ${attendu.cas}`).toBe(attendu.niveau);
      expect(inscription?.redoublant, `redoublement du ${attendu.cas}`).toBe(attendu.redoublant);
      // Les propriétés nulles ne sont pas sérialisées : absence et null sont équivalents.
      expect(inscription?.codeCursusAmenage ?? null).toBe(attendu.codeCursusAmenage);
      expect(inscription?.libelleCursusAmenage ?? null).toBe(attendu.libelleCursusAmenage);
    }
  });

  test("la fiche bénéficiaire affiche les étiquettes niveau, redoublant et cursus aménagé", async ({
    page,
  }, testInfo) => {
    await authentifier(page, UID_CONSULTANT);
    await ouvrirFicheBeneficiaire(page);

    for (const attendu of PARCOURS) {
      const carte = carteInscription(page, attendu.libelleFormation);

      await expect(
        carte.getByText(new RegExp(`Étape\\s*:\\s*${attendu.codeEtape}`)),
        `le code étape du ${attendu.cas} doit être affiché`,
      ).toBeVisible();

      await expect(
        etiquette(carte, attendu.niveau),
        `le niveau du ${attendu.cas} doit être affiché`,
      ).toBeVisible();

      const etiquetteRedoublant = etiquette(carte, "Redoublant");
      if (attendu.redoublant) {
        await expect(etiquetteRedoublant).toBeVisible();
      } else {
        await expect(
          etiquetteRedoublant,
          `aucun redoublement ne doit être signalé sur le ${attendu.cas}`,
        ).toHaveCount(0);
      }

      const etiquetteCursus = etiquette(carte, "Cursus aménagé");
      if (attendu.libelleCursusAmenage) {
        await expect(etiquetteCursus).toBeVisible();

        // L'étiquette reste courte : le libellé complet du cursus aménagé
        // n'est restitué qu'au survol, par une infobulle.
        await etiquetteCursus.hover();
        await expect(
          page.getByRole("tooltip", { name: attendu.libelleCursusAmenage }),
        ).toBeVisible();
        // On quitte l'étiquette pour refermer l'infobulle avant le cas suivant.
        await page.mouse.move(0, 0);
      } else {
        await expect(
          etiquetteCursus,
          `aucun cursus aménagé ne doit être signalé sur le ${attendu.cas}`,
        ).toHaveCount(0);
      }
    }

    // Capture jointe au rapport Playwright, donc écrite dans son répertoire de
    // sortie : elle documente d'un coup d'oeil les quatre cas côte à côte.
    await testInfo.attach("fiche-beneficiaire-profil-academique", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });

  test("les inscriptions sont présentées de la plus récente à la plus ancienne", async ({
    page,
  }) => {
    await authentifier(page, UID_CONSULTANT);
    await ouvrirFicheBeneficiaire(page);

    // Une ligne "Étape : <code>" par carte d'inscription, dans l'ordre du document.
    const lignesEtape = page.locator(".ant-card").locator("text=/Étape\\s*:/");
    await expect(lignesEtape).toHaveCount(PARCOURS.length);

    const ordreAttendu = [...PARCOURS].reverse().map((attendu) => attendu.codeEtape);
    const ordreObtenu = (await lignesEtape.allInnerTexts()).map((texte) =>
      texte.replace(/^.*:\s*/, "").trim(),
    );

    expect(ordreObtenu).toEqual(ordreAttendu);
  });
});
