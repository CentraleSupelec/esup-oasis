/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useState } from "react";
import { FormInstance } from "antd";
import { Questionnaire } from "@context/demande/QuestionnaireTypes";

export interface IUseQuestionnaireNavigationProps {
  questionnaire?: Questionnaire;
  form?: FormInstance;
  onError?: (error: unknown) => void;
}

export const useQuestionnaireNavigation = ({
  questionnaire,
  form,
  onError,
}: IUseQuestionnaireNavigationProps) => {
  const [etapeCourante, setEtapeCourante] = useState<number>(0);
  const [changementEtape, setChangementEtape] = useState<"next" | "previous" | undefined>();

  const etapeSuivante = () => {
    if (!questionnaire || etapeCourante >= (questionnaire.etapes || []).length - 1) return;

    setChangementEtape("next");

    form
      ?.validateFields({ validateOnly: false })
      .then(() => {
        setEtapeCourante((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.getElementById("etape-title")?.focus();
        setChangementEtape(undefined);
      })
      .catch((e) => {
        onError?.(e);
        setChangementEtape(undefined);
      });
  };

  const etapePrecedente = () => {
    if (etapeCourante <= 0) return;

    setChangementEtape("previous");

    form
      ?.validateFields({ validateOnly: false })
      .then(() => {
        setEtapeCourante((prev) => prev - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.getElementById("etape-title")?.focus();
        setChangementEtape(undefined);
      })
      .catch((e) => {
        onError?.(e);
        setChangementEtape(undefined);
      });
  };

  return {
    etapeCourante,
    setEtapeCourante,
    changementEtape,
    etapeSuivante,
    etapePrecedente,
  };
};
