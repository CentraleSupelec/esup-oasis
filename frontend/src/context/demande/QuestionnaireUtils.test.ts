import { describe, it, expect } from "vitest";
import { IDemande, ITypeDemande } from "@api";
import { questionnaireFromDemande, questionnaireFromTypeDemande } from "./QuestionnaireUtils";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TYPE_DEMANDE_BASE = {
  "@id": "/types_demandes/1",
  libelle: "Demande d'aménagement",
} satisfies Partial<ITypeDemande> as unknown as ITypeDemande;

const DEMANDE_SANS_REPONSES: IDemande = {
  "@id": "/demandes/10",
  "@type": "Demande",
  demandeur: null,
  typeDemande: "/types_demandes/1",
  complete: false,
  etapes: [
    {
      "@id": "/etapes_demandes/1",
      etape: "/etapes/1",
      libelle: "Informations générales",
      questions: [
        {
          "@id": "/questions/1",
          question: "/questions/1",
          libelle: "Votre situation",
          typeReponse: "text",
          obligatoire: true,
          choixMultiple: false,
          reponse: null,
        },
      ],
    },
  ],
} as unknown as IDemande;

const DEMANDE_AVEC_REPONSES: IDemande = {
  "@id": "/demandes/20",
  "@type": "Demande",
  demandeur: null,
  typeDemande: "/types_demandes/1",
  complete: true,
  etapes: [
    {
      "@id": "/etapes_demandes/1",
      etape: "/etapes/1",
      libelle: "Informations générales",
      questions: [
        {
          "@id": "/questions/1",
          question: "/questions/1",
          libelle: "Commentaire libre",
          typeReponse: "textarea",
          obligatoire: false,
          choixMultiple: false,
          reponse: {
            "@id": "/reponses/1",
            commentaire: "Texte existant",
            optionsReponses: [],
            piecesJustificatives: [],
          },
        },
        {
          "@id": "/questions/2",
          question: "/questions/2",
          libelle: "Choix multiple",
          typeReponse: "checkbox",
          obligatoire: true,
          choixMultiple: true,
          reponse: {
            "@id": "/reponses/2",
            commentaire: null,
            optionsReponses: [
              { "@id": "/options/A", libelle: "Option A" },
              { "@id": "/options/B", libelle: "Option B" },
            ],
            piecesJustificatives: ["/fichiers/doc1.pdf"],
          },
        },
      ],
    },
  ],
} as unknown as IDemande;

const DEMANDE_ETAPES_NON_TRIEES: IDemande = {
  "@id": "/demandes/30",
  "@type": "Demande",
  demandeur: null,
  typeDemande: "/types_demandes/1",
  complete: false,
  etapes: [
    { "@id": "/etapes_demandes/3", etape: "/etapes/3", libelle: "Étape 3", questions: [] },
    { "@id": "/etapes_demandes/1", etape: "/etapes/1", libelle: "Étape 1", questions: [] },
    { "@id": "/etapes_demandes/2", etape: "/etapes/2", libelle: "Étape 2", questions: [] },
  ],
} as unknown as IDemande;

const TYPE_DEMANDE_AVEC_ETAPES = {
  "@id": "/types_demandes/2",
  libelle: "Demande complexe",
  etapes: [
    {
      "@id": "/etapes/10",
      "@type": "EtapeDemande",
      libelle: "Étape A",
      questions: ["/questions/100", "/questions/101"],
    },
    {
      "@id": "/etapes/20",
      "@type": "EtapeDemande",
      libelle: "Étape B",
      questions: [],
    },
  ],
} as unknown as ITypeDemande;

// ---------------------------------------------------------------------------
// questionnaireFromDemande
// ---------------------------------------------------------------------------

describe("questionnaireFromDemande", () => {
  it("demande sans réponses → structure de base correcte", () => {
    const q = questionnaireFromDemande(DEMANDE_SANS_REPONSES, TYPE_DEMANDE_BASE);

    expect(q["@id"]).toBe("/demandes/10");
    expect(q.typeDemandeId).toBe("/types_demandes/1");
    expect(q.libelle).toBe("Demande d'aménagement");
    expect(q.complete).toBe(false);
    expect(q.etapes).toHaveLength(1);
  });

  it("demande sans réponses → question sans reponse a des valeurs nulles/undefined", () => {
    const q = questionnaireFromDemande(DEMANDE_SANS_REPONSES, TYPE_DEMANDE_BASE);
    const question = q.etapes[0].questions[0] as {
      reponse: { optionChoisie: unknown; commentaire: unknown; piecesJustificatives: unknown };
    };

    expect(question.reponse.optionChoisie).toBeUndefined();
    expect(question.reponse.commentaire).toBeUndefined();
    expect(question.reponse.piecesJustificatives).toBeUndefined();
  });

  it("demande avec réponses → commentaire ré-hydraté", () => {
    const q = questionnaireFromDemande(DEMANDE_AVEC_REPONSES, TYPE_DEMANDE_BASE);
    const question = q.etapes[0].questions[0] as {
      reponse: { commentaire: string };
    };

    expect(question.reponse.commentaire).toBe("Texte existant");
  });

  it("demande avec réponses → optionsReponses mappées en IRIs (optionChoisie)", () => {
    const q = questionnaireFromDemande(DEMANDE_AVEC_REPONSES, TYPE_DEMANDE_BASE);
    const question = q.etapes[0].questions[1] as {
      reponse: { optionChoisie: string[] };
    };

    expect(question.reponse.optionChoisie).toEqual(["/options/A", "/options/B"]);
  });

  it("demande avec réponses → piecesJustificatives ré-hydratées", () => {
    const q = questionnaireFromDemande(DEMANDE_AVEC_REPONSES, TYPE_DEMANDE_BASE);
    const question = q.etapes[0].questions[1] as {
      reponse: { piecesJustificatives: string[] };
    };

    expect(question.reponse.piecesJustificatives).toEqual(["/fichiers/doc1.pdf"]);
  });

  it("demande avec réponses → complete = true", () => {
    const q = questionnaireFromDemande(DEMANDE_AVEC_REPONSES, TYPE_DEMANDE_BASE);
    expect(q.complete).toBe(true);
  });

  it("étapes dans un ordre non-trié → ordre attribué par position dans le tableau (index)", () => {
    const q = questionnaireFromDemande(DEMANDE_ETAPES_NON_TRIEES, TYPE_DEMANDE_BASE);

    expect(q.etapes[0].ordre).toBe(0);
    expect(q.etapes[0]["@id"]).toBe("/etapes/3");
    expect(q.etapes[1].ordre).toBe(1);
    expect(q.etapes[1]["@id"]).toBe("/etapes/1");
    expect(q.etapes[2].ordre).toBe(2);
    expect(q.etapes[2]["@id"]).toBe("/etapes/2");
  });

  it("étapes → @id de l'étape est l'IRI de l'étape (etape.etape), pas l'IRI de la réponse", () => {
    const q = questionnaireFromDemande(DEMANDE_SANS_REPONSES, TYPE_DEMANDE_BASE);
    expect(q.etapes[0]["@id"]).toBe("/etapes/1");
  });

  it("demande sans étapes → etapes vide", () => {
    const demandeSansEtapes = {
      ...DEMANDE_SANS_REPONSES,
      etapes: undefined,
    } as unknown as IDemande;

    const q = questionnaireFromDemande(demandeSansEtapes, TYPE_DEMANDE_BASE);
    expect(q.etapes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// questionnaireFromTypeDemande
// ---------------------------------------------------------------------------

describe("questionnaireFromTypeDemande", () => {
  it("typeDemande sans étapes → questionnaire vide, complete = false", () => {
    const q = questionnaireFromTypeDemande(TYPE_DEMANDE_BASE);

    expect(q["@id"]).toBe("/types_demandes/1");
    expect(q.typeDemandeId).toBe("/types_demandes/1");
    expect(q.libelle).toBe("Demande d'aménagement");
    expect(q.complete).toBe(false);
    expect(q.etapes).toEqual([]);
  });

  it("typeDemande avec étapes → @id et libelle correctement mappés", () => {
    const q = questionnaireFromTypeDemande(TYPE_DEMANDE_AVEC_ETAPES);

    expect(q.etapes).toHaveLength(2);
    expect(q.etapes[0]["@id"]).toBe("/etapes/10");
    expect(q.etapes[0].libelle).toBe("Étape A");
    expect(q.etapes[1]["@id"]).toBe("/etapes/20");
  });

  it("typeDemande avec étapes → ordre attribué par position dans le tableau (index)", () => {
    const q = questionnaireFromTypeDemande(TYPE_DEMANDE_AVEC_ETAPES);

    expect(q.etapes[0].ordre).toBe(0);
    expect(q.etapes[1].ordre).toBe(1);
  });

  it("typeDemande avec questions IRI → questions transmises telles quelles", () => {
    const q = questionnaireFromTypeDemande(TYPE_DEMANDE_AVEC_ETAPES);

    expect(q.etapes[0].questions).toEqual(["/questions/100", "/questions/101"]);
  });

  it("complete est toujours false pour un template de type demande", () => {
    const q = questionnaireFromTypeDemande(TYPE_DEMANDE_AVEC_ETAPES);
    expect(q.complete).toBe(false);
  });
});
