/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { FormInstance } from "antd";
import dayjs from "dayjs";
import { ICampagneDemande, IDemande, ITypeDemande } from "@api";
import { EtatInfo } from "@lib";

export enum FONCTIONNALITES {
  DECLARER_RECEPTIONNEE = "DECLARER_RECEPTIONNEE",
  ATTRIBUER_PROFIL = "ATTRIBUER_PROFIL",
  STATUER_ACCOMPAGNEMENT = "STATUER_ACCOMPAGNEMENT",
  DECLARER_CONFORMITE_DEMANDE = "DECLARER_CONFORMITE_DEMANDE",
  MODIFIER_QUESTIONNAIRE = "MODIFIER_QUESTIONNAIRE",
}

export type QuestionnaireReponse = {
  optionChoisie?: string[] | null;
  commentaire?: string | null;
  piecesJustificatives?: string[];
};

export type QuestionnaireQuestion = {
  "@id": string;
  libelle: string;
  aide?: string | null;
  typeReponse: string;
  obligatoire: boolean;
  choixMultiple: boolean;
  reponse?: QuestionnaireReponse;
};

export type QuestionnaireEtape = {
  "@id": string;
  libelle?: string;
  ordre?: number;
  questions: QuestionnaireQuestion[] | string[];
};

export type Questionnaire = {
  "@id": string;
  typeDemandeId: string;
  libelle?: string;
  complete: boolean;
  etapes: QuestionnaireEtape[];
};

export interface QuestionnaireContextType {
  typeDemande?: ITypeDemande;
  form?: FormInstance;
  demande?: IDemande;
  etatDemande?: EtatInfo;
  questionnaire?: Questionnaire;
  mode: "preview" | "saisie";
  setMode: (mode: "preview" | "saisie") => void;
  submitting?: boolean;
  setSubmitting: (submitting: boolean) => void;
  campagne?: ICampagneDemande;
  blocage?: boolean;
  setBlocage: (blocage: boolean) => void;
  questUtils?: {
    isGrantedQuestionnaire: (
      fonctionnalite: FONCTIONNALITES,
      rolesCommission?: string[],
    ) => boolean;
    envoyerReponse: (
      questionId: string,
      type: string,
      value: string | string[] | undefined,
      onSuccess?: () => void,
      onError?: (error: unknown) => void,
    ) => void;
    getFormInitialValues: () =>
      | undefined
      | FlatArray<
          {
            [p: string]: string | string[] | null | undefined | dayjs.Dayjs | boolean;
          }[][],
          1
        >;
  };
}
