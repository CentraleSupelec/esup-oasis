/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import dayjs from "dayjs";
import { IDemande, ITypeDemande } from "@api";
import { Questionnaire, QuestionnaireEtape } from "@context/demande/QuestionnaireTypes";

/**
 * Create a questionnaire from a demande.
 * @param demande
 * @param typeDemande
 */
export function questionnaireFromDemande(
  demande: IDemande,
  typeDemande: ITypeDemande,
): Questionnaire {
  return {
    "@id": demande["@id"] as string,
    typeDemandeId: demande.typeDemande as string,
    libelle: typeDemande.libelle,
    complete: demande.complete || false,
    etapes: (demande.etapes || [])?.map((etape, index) => {
      return {
        "@id": etape.etape as string,
        libelle: etape.libelle,
        ordre: index,
        questions: (etape.questions || []).map((question) => ({
          "@id": question.question as string,
          libelle: question.libelle as string,
          aide: question.aide,
          typeReponse: question.typeReponse as string,
          obligatoire: question.obligatoire ?? false,
          choixMultiple: question.choixMultiple ?? false,
          reponse: {
            optionChoisie: question.reponse?.optionsReponses?.map(
              (option) => option["@id"] as string,
            ),
            commentaire: question.reponse?.commentaire,
            piecesJustificatives: question.reponse?.piecesJustificatives,
          },
        })),
      };
    }),
  };
}

/**
 * Create a questionnaire from a type demande.
 * @param typeDemande
 */
export function questionnaireFromTypeDemande(typeDemande: ITypeDemande): Questionnaire {
  return {
    "@id": typeDemande["@id"] as string,
    typeDemandeId: typeDemande["@id"] as string,
    libelle: typeDemande.libelle,
    complete: false,
    etapes: (typeDemande.etapes || [])?.map((td, index) => {
      return {
        "@id": td["@id"] as string,
        libelle: td.libelle,
        ordre: index,
        questions: td.questions,
      } as QuestionnaireEtape;
    }),
  };
}

/**
 * Get the value of a response.
 * @param type
 * @param value
 * @param commentaire
 * @param pieceJustificative
 */
export function getReponseValue(
  type: string,
  value: string | string[] | null | undefined,
  commentaire: string | null | undefined,
  pieceJustificative?: string | string[],
) {
  switch (type) {
    case "text":
    case "numeric":
    case "textarea":
      return commentaire;
    case "date":
      return commentaire ? dayjs(commentaire) : null;
    case "checkbox":
    case "select":
      return value;
    case "radio":
      return Array.isArray(value) ? value[0] : value;
    case "file":
      return pieceJustificative;
  }
  return null;
}

/**
 * Get the initial values for the form.
 */
export function getFormInitialValues(questionnaire?: Questionnaire):
  | undefined
  | FlatArray<
      {
        [p: string]: string | string[] | null | undefined | dayjs.Dayjs | boolean;
      }[][],
      1
    > {
  if (!questionnaire) return undefined;
  return questionnaire.etapes
    .map((etape: QuestionnaireEtape) => {
      return etape.questions.map((question) => {
        // si question est de type string
        if (typeof question === "string") {
          return {};
        }
        return {
          [question["@id"]]: getReponseValue(
            question.typeReponse,
            question.reponse?.optionChoisie,
            question.reponse?.commentaire,
            question.reponse?.piecesJustificatives,
          ),
        };
      });
    })
    .flat()
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
}
