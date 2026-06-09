/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Form, InputNumber, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";
import { QuestionAide } from "@controls/Questionnaire/Question/QuestionAide";
import { QuestionnaireQuestion, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import React from "react";

export function QuestionNumeric(props: { question: QuestionnaireQuestion }) {
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const { questUtils, mode } = useQuestionnaire();

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
        <InputNumber
          disabled={mode === "preview" || submitting}
          data-question={props.question["@id"]}
          data-type={props.question.typeReponse}
          changeOnWheel={false}
          decimalSeparator=","
          onBlur={(e) => {
            setSubmitting(true);
            questUtils?.envoyerReponse(
              props.question["@id"] as string,
              props.question.typeReponse as string,
              e.target.value,
              () => setSubmitting(false),
            );
          }}
        />
      </Form.Item>
      <QuestionAide question={props.question} />
    </>
  );
}
