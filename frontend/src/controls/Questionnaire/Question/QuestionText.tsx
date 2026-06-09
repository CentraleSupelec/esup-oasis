/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Form, Input, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";
import { QuestionAide } from "@controls/Questionnaire/Question/QuestionAide";
import { QuestionnaireQuestion, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import React from "react";
import { InputStatus } from "antd/es/_util/statusUtils";

export function QuestionText(props: { question: QuestionnaireQuestion }) {
  const { questUtils, mode, form } = useQuestionnaire();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<InputStatus>();

  return (
    <>
      <Form.Item
        className="mb-0"
        rules={
          mode !== "preview" && props.question.obligatoire
            ? [{ required: true, message: "Le champ est obligatoire" }]
            : []
        }
        required={props.question.obligatoire}
        rootClassName="question-item"
        label={
          <Space className="question" orientation="horizontal">
            <MinusOutlined aria-hidden={true} />
            <div>{props.question.libelle}</div>
          </Space>
        }
        name={props.question["@id"]}
      >
        <Input
          status={status}
          data-question={props.question["@id"]}
          data-type={props.question.typeReponse}
          disabled={mode === "preview" || submitting}
          onBlur={(e) => {
            setSubmitting(true);
            questUtils?.envoyerReponse(
              props.question["@id"] as string,
              props.question.typeReponse as string,
              e.target.value,
              () => {
                setSubmitting(false);
                setStatus(undefined);
              },
              () => {
                setSubmitting(false);
                setStatus("error");

                // Si le champ est obligatoire et qu'il est vide, on remet la valeur à undefined
                // C'est principalement pour le cas des mauvais numéros PSQS
                window.setTimeout(() => {
                  if (props.question.obligatoire && e.target.value !== "") {
                    form?.setFieldValue(props.question["@id"], undefined);
                    (form?.getFieldInstance(props.question["@id"]) as HTMLInputElement).focus();
                  }
                }, 500);
              },
            );
          }}
        />
      </Form.Item>
      <QuestionAide question={props.question} />
    </>
  );
}
