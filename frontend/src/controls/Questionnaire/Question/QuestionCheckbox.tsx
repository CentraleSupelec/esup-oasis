/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Checkbox, Form, Skeleton, Space } from "antd";
import { QuestionAide } from "@controls/Questionnaire/Question/QuestionAide";
import { QuestionnaireQuestion, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { MinusOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import React from "react";
import { cleanUri } from "@utils/string";

export function QuestionCheckbox(props: { question: QuestionnaireQuestion }) {
  const { questUtils, mode, submitting } = useQuestionnaire();
  const { data: questionApi, isFetching } = useApi().useGetItem({
    path: "/questions/{id}",
    url: props.question["@id"],
  });

  return (
    <>
      <Form.Item
        className="mb-0"
        rootClassName="question-item"
        name={props.question["@id"]}
        label={
          <Space className="question" orientation="horizontal">
            <MinusOutlined aria-hidden={true} />
            <div id={cleanUri(props.question["@id"])}>{props.question.libelle}</div>
          </Space>
        }
        rules={[
          // choix unique si props.question.choixMultiple === false
          {
            validator: async (_, value) => {
              if (!props.question.choixMultiple) {
                if (value && value.length > 1) {
                  return Promise.reject(
                    new Error("Vous ne pouvez sélectionner qu'une seule option"),
                  );
                }
              }
              return Promise.resolve();
            },
          },
          // Au moins une réponse si props.question.obligatoire === true
          {
            validator: async (_, value) => {
              if (props.question.obligatoire) {
                if (!value || value.length === 0) {
                  return Promise.reject(new Error("La sélection est obligatoire"));
                }
              }
              return Promise.resolve();
            },
          },
        ]}
        required={props.question.obligatoire}
      >
        {isFetching || !questionApi ? (
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        ) : (
          <Checkbox.Group
            aria-labelledby={cleanUri(props.question["@id"])}
            disabled={mode === "preview" || submitting}
            data-question={props.question["@id"]}
            data-type={props.question.typeReponse}
            className="question-checkbox"
            options={questionApi.optionsReponses?.map((r) => ({
              label: r.libelle,
              value: r["@id"] as string,
            }))}
            onChange={(e) => {
              questUtils?.envoyerReponse(
                props.question["@id"] as string,
                props.question.typeReponse as string,
                e,
              );
            }}
          />
        )}
      </Form.Item>
      <QuestionAide question={props.question} />
    </>
  );
}
