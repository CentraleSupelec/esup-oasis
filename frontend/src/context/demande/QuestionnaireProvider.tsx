/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Form } from "antd";
import { IDemande, ITypeDemande } from "@api";
import { getEtatDemande } from "@lib";
import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import {
  FONCTIONNALITES,
  Questionnaire,
  QuestionnaireContextType,
} from "@context/demande/QuestionnaireTypes";
import { MATRICE_DROITS_ROLES } from "@context/demande/QuestionnaireRights";
import {
  getFormInitialValues,
  questionnaireFromDemande,
  questionnaireFromTypeDemande,
} from "@context/demande/QuestionnaireUtils";

export * from "@context/demande/QuestionnaireTypes";
export { MATRICE_DROITS_ROLES } from "@context/demande/QuestionnaireRights";
export { useQuestionnaireNavigation } from "@context/demande/useQuestionnaireNavigation";

const QuestionnaireContext = createContext<QuestionnaireContextType>(null!);

/**
 * Provide the questionnaire context to child components.
 *
 * @function QuestionnaireProvider
 * @param {Object} props - The properties for the QuestionnaireProvider component.
 * @returns {ReactElement} The QuestionnaireProvider component.
 */
export function QuestionnaireProvider(props: {
  typeDemandeId?: string;
  demandeId?: string;
  mode?: "preview" | "saisie";
  children: ReactNode;
}): ReactElement {
  const auth = useAuth();

  const [typeDemande, setTypeDemande] = useState<ITypeDemande>();
  const [demande, setDemande] = useState<IDemande>();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
  const [form] = Form.useForm();
  const [mode, setMode] = useState<"preview" | "saisie">(props.mode || "saisie");
  const [blocage, setBlocage] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // API : Get the demande data.
  const { data: demandeData, refetch: refetchDemande } = useApi().useGetItem({
    path: "/demandes/{id}",
    url: props.demandeId,
    enabled: !!props.demandeId,
  });

  useEffect(() => {
    if (demandeData) {
      // React Query remet data à undefined quand enabled passe à false (ex. demandeId absent).
      // Le garde préserve la dernière valeur connue et évite un flash de rendu vide.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDemande(demandeData);
    }
  }, [demandeData]);

  // API : Get the typeDemande data.
  const { data: typeDemandeData } = useApi().useGetItem({
    path: "/types_demandes/{id}",
    url: props.typeDemandeId || demandeData?.typeDemande,
    enabled: !!props.typeDemandeId || !!demandeData?.typeDemande,
  });

  useEffect(() => {
    if (typeDemandeData) {
      // Même raison que pour setDemande : garde contre le retour à undefined
      // quand enabled devient false (typeDemandeId et typeDemande absents).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypeDemande(typeDemandeData);
    }
  }, [typeDemandeData]);

  // API : Get the campagne data.
  const { data: campagne } = useApi().useGetItem({
    path: "/types_demandes/{typeId}/campagnes/{id}",
    url: demande?.campagne,
    enabled: !!demande?.campagne,
  });

  // Build questionnaire
  useEffect(() => {
    if (props.demandeId && demande && typeDemande) {
      // Pour gestionnaire + demandeur
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestionnaire(questionnaireFromDemande(demande, typeDemande));
    } else if (props.typeDemandeId && typeDemande && !props.demandeId) {
      // Pour l'admin

      setQuestionnaire(questionnaireFromTypeDemande(typeDemande));
    }
  }, [demande, props, typeDemande]);

  // Send reponse to API
  const mutationReponse = useApi().usePut({
    path: "/demandes/{demandeId}/questions/{questionId}/reponse",
    onSuccess: () => {
      setBlocage(false);
      refetchDemande().then();
    },
  });
  const { mutate: mutationReponseMutate } = mutationReponse;

  const etatDemande = useMemo(
    () => (demande ? getEtatDemande(demande.etat as string) : undefined),
    [demande],
  );

  const isGrantedQuestionnaire = useCallback(
    (fonctionnalite: FONCTIONNALITES, rolesCommission?: string[]): boolean => {
      if (!auth.user) return false;
      for (const role of auth.user.roles) {
        if (role) {
          const droits = MATRICE_DROITS_ROLES[role];
          if (droits && droits[fonctionnalite] && typeof droits[fonctionnalite] === "boolean") {
            return droits[fonctionnalite] as boolean;
          } else if (droits && droits[fonctionnalite]) {
            return (droits[fonctionnalite] as (r: string[]) => boolean)(rolesCommission || []);
          }
        }
      }
      return false;
    },
    [auth.user],
  );

  /**
   * Send a response to the API.
   * @param questionId
   * @param type
   * @param value
   * @param onSuccess
   * @param onError
   */
  const envoyerReponse = useCallback(
    (
      questionId: string,
      type: string,
      value: string | string[] | undefined,
      onSuccess?: () => void,
      onError?: (error: unknown) => void,
    ) => {
      if (!demande) return;

      setSubmitting(true);
      let valueToSend: string[] = [];
      let commentaireToSend = null;
      let pieceJustificativeToSend: string[] | undefined = undefined;

      switch (type) {
        case "text":
        case "textarea":
        case "date":
        case "submit":
          valueToSend = [];
          commentaireToSend = Array.isArray(value) ? value[0] : value;
          break;
        case "numeric":
          if (isNaN(Number(value))) {
            return;
          } else {
            valueToSend = [];
            commentaireToSend = Array.isArray(value) ? value[0] : value;
          }
          break;
        case "radio":
        case "checkbox":
        case "select":
          valueToSend = Array.isArray(value) ? value : ((value ? [value] : []) as string[]);
          commentaireToSend = null;
          break;
        case "file":
          pieceJustificativeToSend = Array.isArray(value)
            ? value
            : ((value ? [value] : []) as string[]);
      }

      // mutationReponseMutate est stable (garanti par React Query)
      mutationReponseMutate(
        {
          "@id": `${demande["@id"] + questionId}/reponse` as string,
          data: {
            optionsChoisies: valueToSend,
            commentaire: commentaireToSend,
            piecesJustificatives: pieceJustificativeToSend,
          },
        },
        {
          onSuccess: () => {
            onSuccess?.();
            setSubmitting(false);
          },
          onError: (error: unknown) => {
            onError?.(error);
            setSubmitting(false);
          },
        },
      );
    },
    [demande, mutationReponseMutate, setSubmitting],
  );

  const contextValue = useMemo(
    () => ({
      typeDemande,
      form,
      demande,
      questionnaire,
      mode,
      setMode,
      submitting,
      setSubmitting,
      etatDemande,
      campagne,
      blocage,
      setBlocage,
      questUtils: {
        isGrantedQuestionnaire,
        envoyerReponse,
        getFormInitialValues: () => getFormInitialValues(questionnaire),
      },
    }),
    [
      typeDemande,
      form,
      demande,
      questionnaire,
      mode,
      submitting,
      etatDemande,
      campagne,
      blocage,
      isGrantedQuestionnaire,
      envoyerReponse,
    ],
  );

  // Provide the context to child components.
  return (
    <QuestionnaireContext.Provider value={contextValue}>
      {props.children}
    </QuestionnaireContext.Provider>
  );
}

/**
 * @function useQuestionnaire
 * @returns {QuestionnaireContextType} The context for the questionnaire.
 */
export function useQuestionnaire(): QuestionnaireContextType {
  const ctx = useContext(QuestionnaireContext);
  if (ctx === null)
    throw new Error("useQuestionnaire doit être utilisé dans un <QuestionnaireProvider>");
  return ctx;
}
