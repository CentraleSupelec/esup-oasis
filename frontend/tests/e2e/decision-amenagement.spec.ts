/**
 * Décision d'aménagement (PAEH) : catégories d'aménagements, observations
 * particulières et date de l'avis médical.
 *
 * Ce que la suite valide fonctionnellement :
 *  1. le dossier du bénéficiaire présente ses aménagements dans les trois
 *     catégories que la décision reprend : aménagements des études, aides
 *     humaines et aménagements des examens ;
 *  2. les observations particulières et la date de l'avis rendu par le médecin
 *     désigné par la CDAPH sont enregistrées sur la décision puis relues ;
 *  3. la décision s'édite bien en document PDF une fois ces données en place.
 *
 * Pourquoi le contenu textuel du PDF n'est pas asserté : le document est produit
 * par Chromium, qui embarque des polices en sous ensembles de type
 * CIDFontType2. Dans les flux de contenu, les chaînes sont des identifiants de
 * glyphes et non du texte ; les relire imposerait d'interpréter les tables
 * ToUnicode, donc d'ajouter au frontend une dépendance d'analyse de PDF utile à
 * ce seul test. La vérification porte donc sur les surfaces lisibles et
 * stables : l'interface pour les trois catégories, l'API pour les deux champs
 * libres de la décision, et la production réelle du document pour la chaîne
 * d'édition. Une erreur de gabarit ou de normalisation fait échouer l'étape 3,
 * et le PDF est joint au rapport pour la relecture visuelle.
 *
 * Les observations et la date d'avis médical sont vérifiées sur le contrat API,
 * qui est la source que le gabarit du document consomme : le formulaire de
 * saisie n'est proposé par l'interface que lorsque la décision est en attente
 * de validation, état dans lequel le serveur refuse la modification.
 *
 * Prérequis : la pile applicative est démarrée et les fixtures de test du
 * backend sont chargées (php bin/console hautelook:fixtures:load).
 */

import { expect, test, type APIRequestContext, type APIResponse } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { E2E_API_URL, E2E_BACKEND_CONTAINER, E2E_BASE_URL, E2E_JWT_COOKIE_NAME } from "./env";

/** Compte porteur du rôle gestionnaire dans les fixtures de test du backend. */
const UID_OPERATEUR = "admin";

/** Bénéficiaire des fixtures de test qui porte une décision d'aménagement. */
const UID_BENEFICIAIRE = "beneficiaire-decision";

const OBSERVATIONS =
  "Aménagements accordés pour l'année universitaire en cours, à réévaluer en cas de nouvelle situation.";

/**
 * Les trois catégories d'aménagements reprises sur la décision, avec le
 * paramètre de navigation qui ouvre l'onglet correspondant du dossier, le titre
 * qui y est affiché, et le filtre de collection qui les sélectionne côté API.
 */
const CATEGORIES = [
  { domaine: "pedagogique", titre: "Aménagements pédagogiques", filtre: "type.pedagogique" },
  { domaine: "aideHumaine", titre: "Aides humaines", filtre: "type.aideHumaine" },
  { domaine: "examen", titre: "Aménagements d'examen", filtre: "type.examens" },
] as const;

type Categorie = (typeof CATEGORIES)[number];

type TypeAmenagement = {
  "@id": string;
  libelle: string;
  actif: boolean;
  pedagogique: boolean;
  aideHumaine: boolean;
  examens: boolean;
};

let api: APIRequestContext;
let jeton: string;
let decisionIri: string;

/** Libellé du type d'aménagement retenu pour chaque catégorie. */
const libelleParCategorie = new Map<Categorie["domaine"], string>();

/** Aménagements créés par la suite, et donc à retirer à la fin. */
const amenagementsCrees: string[] = [];

/**
 * Année universitaire en cours, selon la même règle que le backend : elle
 * démarre au 1er septembre, donc janvier à août relèvent de l'année civile
 * précédente.
 */
function anneeUniversitaireCourante(aujourdhui = new Date()): number {
  return aujourdhui.getMonth() >= 8 ? aujourdhui.getFullYear() : aujourdhui.getFullYear() - 1;
}

/** Vrai si le type d'aménagement relève de la catégorie donnée. */
function releveDe(type: TypeAmenagement, domaine: Categorie["domaine"]): boolean {
  switch (domaine) {
    case "pedagogique":
      return type.pedagogique;
    case "aideHumaine":
      return type.aideHumaine;
    default:
      return type.examens;
  }
}

/**
 * Signe un jeton applicatif pour un utilisateur des fixtures, sans passer par
 * le fournisseur d'identité de l'établissement. La commande est exécutée dans
 * le conteneur backend, dont le nom reste surchargeable par variable
 * d'environnement.
 */
function signerJeton(uid: string): string {
  const sortie = execFileSync(
    "docker",
    [
      "exec",
      E2E_BACKEND_CONTAINER,
      "php",
      "bin/console",
      "lexik:jwt:generate-token",
      uid,
      "--user-class=App\\Entity\\Utilisateur",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );

  const jetonSigne = sortie
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter((ligne) => /^[\w-]+\.[\w-]+\.[\w-]+$/.test(ligne))
    .pop();

  if (!jetonSigne) {
    throw new Error(
      `Aucun jeton signé pour "${uid}". Le conteneur backend tourne-t-il, et les fixtures ` +
        `de test sont-elles chargées ? Son nom se surcharge avec E2E_BACKEND_CONTAINER.`,
    );
  }

  return jetonSigne;
}

/** Corps JSON d'une réponse, en signalant l'appel fautif si elle est en erreur. */
async function json<T>(reponse: APIResponse): Promise<T> {
  if (!reponse.ok()) {
    throw new Error(`${reponse.url()} a répondu ${reponse.status()} : ${await reponse.text()}`);
  }
  return (await reponse.json()) as T;
}

/**
 * Garantit que le bénéficiaire porte un aménagement du type demandé sur l'année
 * universitaire en cours. Un aménagement déjà présent est réutilisé, ce qui rend
 * la suite rejouable sans rechargement des fixtures.
 */
async function assurerAmenagement(typeIri: string, commentaire: string): Promise<void> {
  const existants = await json<{ "hydra:member": { typeAmenagement: string }[] }>(
    await api.get(`/utilisateurs/${UID_BENEFICIAIRE}/amenagements?itemsPerPage=200`),
  );
  if (existants["hydra:member"].some((amenagement) => amenagement.typeAmenagement === typeIri)) {
    return;
  }

  const annee = anneeUniversitaireCourante();
  const cree = await json<{ "@id": string }>(
    await api.post(`/utilisateurs/${UID_BENEFICIAIRE}/amenagements`, {
      headers: { "Content-Type": "application/ld+json" },
      data: {
        typeAmenagement: typeIri,
        debut: `${annee}-09-01`,
        fin: `${annee + 1}-08-31`,
        semestre1: true,
        semestre2: true,
        commentaire,
      },
    }),
  );

  amenagementsCrees.push(cree["@id"]);
}

test.describe.configure({ mode: "serial" });

test.describe("Décision d'aménagement (PAEH)", () => {
  test.beforeAll(async ({ playwright }) => {
    jeton = signerJeton(UID_OPERATEUR);
    api = await playwright.request.newContext({
      baseURL: E2E_API_URL,
      extraHTTPHeaders: {
        Accept: "application/ld+json",
        Authorization: `Bearer ${jeton}`,
      },
    });

    // Un même type d'aménagement peut relever de plusieurs catégories : on
    // retient un type par catégorie, puis on dédoublonne pour ne créer que le
    // strict nécessaire.
    const referentiel = await json<{ "hydra:member": TypeAmenagement[] }>(
      await api.get("/types_amenagements?itemsPerPage=200"),
    );
    const actifs = referentiel["hydra:member"].filter((type) => type.actif);

    const typesRetenus = new Map<string, string>();
    for (const categorie of CATEGORIES) {
      const type = actifs.find((candidat) => releveDe(candidat, categorie.domaine));
      expect(
        type,
        `Aucun type d'aménagement actif pour la catégorie "${categorie.titre}" dans le référentiel.`,
      ).toBeDefined();
      libelleParCategorie.set(categorie.domaine, type!.libelle);
      typesRetenus.set(type!["@id"], type!.libelle);
    }

    for (const [typeIri, libelle] of typesRetenus) {
      await assurerAmenagement(typeIri, `Modalité précisée pour : ${libelle}.`);
    }

    const beneficiaire = await json<{ decisionAmenagementAnneeEnCours?: { "@id": string } }>(
      await api.get(`/utilisateurs/${UID_BENEFICIAIRE}`),
    );
    expect(
      beneficiaire.decisionAmenagementAnneeEnCours,
      `Le bénéficiaire "${UID_BENEFICIAIRE}" ne porte aucune décision pour l'année en cours. ` +
        `Rechargez les fixtures de test du backend.`,
    ).toBeDefined();

    decisionIri = beneficiaire.decisionAmenagementAnneeEnCours!["@id"];
  });

  test.beforeEach(async ({ context }) => {
    // Le frontend s'authentifie sur le cookie applicatif, dont le nom suit celui
    // configuré côté backend, et retient l'identifiant connecté pour recharger
    // le profil au démarrage.
    await context.addCookies([
      {
        name: E2E_JWT_COOKIE_NAME,
        value: jeton,
        domain: new URL(E2E_API_URL).hostname,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    await context.addInitScript((uid) => {
      window.localStorage.setItem("login", JSON.stringify(uid));
    }, UID_OPERATEUR);
  });

  test.afterAll(async () => {
    for (const amenagement of amenagementsCrees) {
      await api.delete(amenagement);
    }
    amenagementsCrees.length = 0;

    if (decisionIri) {
      await api.patch(decisionIri, {
        headers: { "Content-Type": "application/merge-patch+json" },
        data: { observations: null, dateAvisMedecin: null },
      });
    }

    await api.dispose();
  });

  test("le dossier du bénéficiaire présente les trois catégories d'aménagements", async ({
    page,
  }) => {
    for (const categorie of CATEGORIES) {
      // Chaque catégorie s'atteint directement par son paramètre de navigation,
      // ce qui évite de dépendre de l'ordre des onglets du dossier.
      const dossier = new URL(
        `/beneficiaires/${UID_BENEFICIAIRE}?domaine=${categorie.domaine}`,
        E2E_BASE_URL,
      );
      await page.goto(dossier.toString());

      const onglet = page.locator(".ant-tabs-tabpane-active");
      await expect(
        onglet.getByRole("heading", { level: 3, name: categorie.titre }),
        `L'onglet "${categorie.titre}" du dossier doit être affiché.`,
      ).toBeVisible();

      const libelleAttendu = libelleParCategorie.get(categorie.domaine)!;
      await expect(
        onglet.getByText(libelleAttendu).first(),
        `La catégorie "${categorie.titre}" doit lister l'aménagement "${libelleAttendu}".`,
      ).toBeVisible();
    }
  });

  test("chaque catégorie de la décision retient bien les aménagements du bénéficiaire", async () => {
    for (const categorie of CATEGORIES) {
      await expect
        .poll(
          async () => {
            const collection = await json<{ "hydra:totalItems": number }>(
              await api.get(
                `/utilisateurs/${UID_BENEFICIAIRE}/amenagements?${categorie.filtre}=true`,
              ),
            );
            return collection["hydra:totalItems"];
          },
          { message: `La catégorie "${categorie.titre}" doit alimenter la décision.` },
        )
        .toBeGreaterThan(0);
    }
  });

  test("les observations et la date de l'avis médical sont enregistrées puis relues", async () => {
    const dateAvisMedecin = `${anneeUniversitaireCourante()}-09-15`;

    const enregistrement = await json<{ observations: string; dateAvisMedecin: string }>(
      await api.patch(decisionIri, {
        headers: { "Content-Type": "application/merge-patch+json" },
        data: { observations: OBSERVATIONS, dateAvisMedecin },
      }),
    );
    expect(enregistrement.observations).toBe(OBSERVATIONS);
    expect(enregistrement.dateAvisMedecin).toContain(dateAvisMedecin);

    const relecture = await json<{ observations: string; dateAvisMedecin: string }>(
      await api.get(decisionIri),
    );
    expect(
      relecture.observations,
      "Les observations doivent être conservées entre deux consultations.",
    ).toBe(OBSERVATIONS);
    expect(
      relecture.dateAvisMedecin,
      "La date de l'avis médical doit être conservée entre deux consultations.",
    ).toContain(dateAvisMedecin);
  });

  test("la décision s'édite en document PDF", async () => {
    const reponse = await api.get(decisionIri, { headers: { Accept: "application/pdf" } });

    expect(reponse.status(), "L'édition de la décision doit aboutir.").toBe(200);
    expect(reponse.headers()["content-type"]).toContain("application/pdf");

    const document = await reponse.body();
    expect(
      document.subarray(0, 5).toString("latin1"),
      "La réponse doit porter la signature d'un PDF.",
    ).toBe("%PDF-");
    expect(
      document.byteLength,
      "Un document reprenant les aménagements et les observations n'est pas un PDF vide.",
    ).toBeGreaterThan(1024);

    // Le document est joint au rapport : la relecture visuelle des trois
    // catégories, des observations et de la date d'avis médical reste possible
    // sans dépendance d'analyse de PDF.
    await test.info().attach("decision-amenagement.pdf", {
      body: document,
      contentType: "application/pdf",
    });
  });
});
