/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Alert, Form, Spin } from "antd";
import { ExclamationOutlined } from "@ant-design/icons";
import { QuestionFile } from "@controls/Questionnaire/Question/QuestionFile";
import { QuestionDate } from "@controls/Questionnaire/Question/QuestionDate";
import { QuestionSelect } from "@controls/Questionnaire/Question/QuestionSelect";
import { QuestionRadio } from "@controls/Questionnaire/Question/QuestionRadio";
import { QuestionText } from "@controls/Questionnaire/Question/QuestionText";
import { QuestionTextarea } from "@controls/Questionnaire/Question/QuestionTextarea";

import "@controls/Questionnaire/Question/Question.scss";
import { QuestionNumeric } from "@controls/Questionnaire/Question/QuestionNumeric";
import { QuestionCheckbox } from "@controls/Questionnaire/Question/QuestionCheckbox";
import { QuestionnaireQuestion } from "@context/demande/QuestionnaireProvider";
import { QuestionInfo } from "@controls/Questionnaire/Question/QuestionInfo";
import { QuestionSubmit } from "@controls/Questionnaire/Question/QuestionSubmit";
import { useApi } from "@context/api/ApiProvider";
import { QuestionBlocage } from "@controls/Questionnaire/Question/QuestionBlocage";

export function Question(props: {
  question?: QuestionnaireQuestion;
  questionId?: string;
}): React.ReactElement {
  const { data } = useApi().useGetItem({
    path: "/questions/{id}",
    url: props.questionId as string,
    enabled: !!props.questionId,
  });

  const question = React.useMemo(() => {
    if (props.question) return props.question;
    if (data) {
      return {
        "@id": data["@id"] as string,
        libelle: data.libelle as string,
        aide: data.aide,
        typeReponse: data.typeReponse as string,
        obligatoire: data.obligatoire ?? false,
        choixMultiple: data.choixMultiple ?? false,
      } as QuestionnaireQuestion;
    }
    return undefined;
  }, [props.question, data]);

  if (!question) return <Spin />;

  switch (question.typeReponse) {
    case "text":
      return <QuestionText question={question} />;
    case "numeric":
      return <QuestionNumeric question={question} />;
    case "textarea":
      return <QuestionTextarea question={question} />;
    case "checkbox":
      return <QuestionCheckbox question={question} />;
    case "date":
      return <QuestionDate question={question} />;
    case "file":
      return <QuestionFile key={question["@id"]} question={question} />;

    case "radio":
      return <QuestionRadio question={question} />;
    case "select":
      return <QuestionSelect question={question} />;

    case "info":
      if (question.obligatoire) {
        return <QuestionBlocage question={question} />;
      }

      return <QuestionInfo key={question["@id"]} question={question} />;

    case "submit":
      return <QuestionSubmit question={question} />;

    default:
      return (
        <Form.Item>
          <Alert
            type="error"
            icon={<ExclamationOutlined />}
            showIcon
            title="Erreur"
            description="Type de question inconnu."
          />
        </Form.Item>
      );
  }
}
