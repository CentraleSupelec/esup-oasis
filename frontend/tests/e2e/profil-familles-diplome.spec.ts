import { expect, test, type Locator, type Page } from "@playwright/test";

import { E2E_API_URL, E2E_BACKEND_CONTAINER, E2E_BASE_URL, E2E_JWT_COOKIE_NAME } from "./env";
import { execFileSync } from "node:child_process";

/**
 * Dérivation du niveau d'études par famille de diplôme.
 *
 * Complète profil-academique.spec.ts, qui couvre le cas LMD nominal dont le
 * niveau est aussi encodé par le code étape (L1INFO…). Ici chaque inscription
 * porte au contraire un code étape qui N'ENCODE PAS le niveau (O2CPSD, E2BTGE,
 * UPASS, X2LOCAL) : le repli sur le préfixe du code étape renverrait donc vide,
 * et le niveau observé prouve que la dérivation vient bien du TYPE de diplôme
 * (NiveauResolver, données Apogée cod_tpd_etb / tem_sante / cycle / année).
 *
 * Ce que la spec valide, sur le dossier de référence « familles-diplome » :
 *  1. CPES (type 19) est assimilé à une licence => cycle 1 + année 2 = L2 ;
 *  2. BUT (type 16) affiche son libellé propre => année 2 = BUT2 ;
 *  3. PASS (type 17, santé) n'affiche aucun niveau ;
 *  4. une inscription non synchronisée (type de diplôme absent) n'affiche aucun
 *     niveau : le type étant obligatoire côté établissement, l'absence de type
 *     n'autorise pas de repli nominal LMD (elle ne produit plus de faux niveau).
 *
 * Prérequis d'exécution identiques à profil-academique.spec.ts : pile démarrée
 * et fixtures de test chargées (hautelook:fixtures:load), qui créent ce dossier.
 * Toutes les URL, le conteneur backend et le cookie JWT sont paramétrables par
 * variable d'environnement (voir tests/e2e/env.ts).
 */

/** Compte utilisé pour consulter le dossier : il porte le rôle gestionnaire. */
const UID_CONSULTANT = "gestionnaire";

/** Dossier de référence portant les quatre inscriptions par famille. */
const UID_BENEFICIAIRE = "etudiant-familles-diplome";

/** Étiquettes de niveau possibles, pour vérifier l'absence de niveau sur un cas vide. */
const MOTIF_NIVEAU = /^(?:L[1-3]|M[1-2]|D[1-3]|BUT[1-3]|DEUST[1-2]|LP[1-3]|ING[3-5])$/;

/** Un cas fonctionnel, décrit une seule fois pour l'API et pour l'interface. */
interface CasFamille {
  /** Intitulé fonctionnel, repris dans les messages d'échec. */
  readonly cas: string;
  readonly libelleFormation: string;
  readonly codeEtape: string;
  /** Niveau attendu, ou null quand aucun niveau ne doit être dérivé ni affiché. */
  readonly niveau: string | null;
}

/** Les quatre familles couvertes, de la plus ancienne inscription à la plus récente. */
const CAS: readonly CasFamille[] = [
  {
    cas: "CPES assimilé licence (type 19)",
    libelleFormation: "CPES 2 sciences",
    codeEtape: "O2CPSD",
    niveau: "L2",
  },
  {
    cas: "BUT à libellé propre (type 16)",
    libelleFormation: "BUT 2 gestion des entreprises",
    codeEtape: "E2BTGE",
    niveau: "BUT2",
  },
  {
    cas: "PASS santé, sans niveau (type 17)",
    libelleFormation: "PASS accès santé",
    codeEtape: "UPASS",
    niveau: null,
  },
  {
    cas: "inscription non synchronisée, sans niveau (type absent)",
    libelleFormation: "Formation locale non synchronisée",
    codeEtape: "X2LOCAL",
    niveau: null,
  },
];

/** Projection JSON d'une inscription telle que l'API l'expose sur la fiche utilisateur. */
interface InscriptionApi {
  readonly codeEtape?: string;
  readonly niveau?: string | null;
  readonly formation?: { readonly libelle?: string };
}

interface DossierApi {
  readonly inscriptions?: readonly InscriptionApi[];
}

/**
 * Génère un jeton JWT applicatif pour l'identifiant demandé, via la commande
 * console du backend. Seul moyen de s'authentifier sans dérouler le parcours du
 * fournisseur d'identité externe, indisponible en test.
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

/** Installe une session authentifiée : cookie JWT côté API + marqueur de reconnexion navigateur. */
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

test.describe("Dérivation du niveau par famille de diplôme", () => {
  test.setTimeout(60_000);

  test("l'API dérive le niveau depuis le type de diplôme, pas depuis le code étape", async () => {
    const reponse = await fetch(`${E2E_API_URL}/utilisateurs/${UID_BENEFICIAIRE}`, {
      headers: {
        Accept: "application/ld+json",
        Authorization: `Bearer ${genererJeton(UID_CONSULTANT)}`,
      },
    });
    expect(reponse.status, "la fiche du bénéficiaire de référence doit être lisible").toBe(200);

    const dossier = (await reponse.json()) as DossierApi;
    const inscriptions = dossier.inscriptions ?? [];
    expect(inscriptions).toHaveLength(CAS.length);

    const parEtape = new Map(inscriptions.map((i) => [i.codeEtape, i]));

    for (const attendu of CAS) {
      const inscription = parEtape.get(attendu.codeEtape);
      expect(inscription, `inscription ${attendu.codeEtape} absente de la fiche`).toBeDefined();
      expect(inscription?.formation?.libelle).toBe(attendu.libelleFormation);
      // Les propriétés nulles ne sont pas sérialisées : absence et null équivalents.
      expect(inscription?.niveau ?? null, `niveau du ${attendu.cas}`).toBe(attendu.niveau);
    }
  });

  test("la fiche affiche le niveau propre à chaque famille, et aucun pour les cas sans niveau", async ({
    page,
  }, testInfo) => {
    await authentifier(page, UID_CONSULTANT);
    await ouvrirFicheBeneficiaire(page);

    for (const attendu of CAS) {
      const carte = carteInscription(page, attendu.libelleFormation);

      await expect(
        carte.getByText(new RegExp(`Étape\\s*:\\s*${attendu.codeEtape}`)),
        `le code étape du ${attendu.cas} doit être affiché`,
      ).toBeVisible();

      if (attendu.niveau !== null) {
        await expect(
          etiquette(carte, attendu.niveau),
          `le niveau du ${attendu.cas} doit être affiché`,
        ).toBeVisible();
      } else {
        await expect(
          carte.locator(".ant-tag").filter({ hasText: MOTIF_NIVEAU }),
          `aucun niveau ne doit être affiché sur le ${attendu.cas}`,
        ).toHaveCount(0);
      }
    }

    await testInfo.attach("fiche-beneficiaire-familles-diplome", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
});
