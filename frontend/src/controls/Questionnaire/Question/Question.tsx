/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { Alert, Form, Spin } from "antd";
import { ExclamationOutlined } from "@ant-design/icons";
import { QuestionFile } from "./QuestionFile";
import { QuestionDate } from "./QuestionDate";
import { QuestionSelect } from "./QuestionSelect";
import { QuestionRadio } from "./QuestionRadio";
import { QuestionText } from "./QuestionText";
import { QuestionTextarea } from "./QuestionTextarea";

import "./Question.scss";
import { QuestionNumeric } from "./QuestionNumeric";
import { QuestionCheckbox } from "./QuestionCheckbox";
import { QuestionnaireQuestion } from "../../../context/demande/QuestionnaireProvider";
import { QuestionInfo } from "./QuestionInfo";
import { QuestionSubmit } from "./QuestionSubmit";
import { useApi } from "../../../context/api/ApiProvider";
import { QuestionBlocage } from "./QuestionBlocage";

export function Question(props: {
   question?: QuestionnaireQuestion;
   questionId?: string;
}): React.ReactElement {
   const [question, setQuestion] = useState<QuestionnaireQuestion | undefined>(props.question);
   const { data } = useApi().useGetItem({
      path: "/questions/{id}",
      url: props.questionId as string,
      enabled: !!props.questionId,
   });

   useEffect(() => {
      if (data)
         setQuestion({
            "@id": data["@id"] as string,
            libelle: data.libelle as string,
            aide: data.aide,
            typeReponse: data.typeReponse as string,
            obligatoire: data.obligatoire ?? false,
            choixMultiple: data.choixMultiple ?? false,
         });
   }, [data]);

   useEffect(() => {
      setQuestion(props.question);
   }, [props.question]);

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
         return <QuestionFile question={question} />;

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
