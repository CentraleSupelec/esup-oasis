/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { List, Space } from "antd";
import { MinusOutlined } from "@ant-design/icons";

import { QuestionnaireQuestion, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { QuestionFileItem } from "@controls/Questionnaire/Question/QuestionFileItem";

export function DossierDemandeTabPiecesJustificatives(): React.ReactElement {
  const { questionnaire } = useQuestionnaire();

  const questions: QuestionnaireQuestion[] = React.useMemo(() => {
    return (
      questionnaire?.etapes
        ?.map((e) =>
          e.questions
            ?.map((q) => q as QuestionnaireQuestion)
            .filter((q) => q.typeReponse === "file"),
        )
        .flat() || []
    );
  }, [questionnaire]);

  return (
    <div>
      <h2>Pièces justificatives</h2>

      <List className="ant-list-radius">
        {questions.map((question) => (
          <List.Item key={question["@id"]}>
            <div className="w-100 d-block">
              <Space className="question w-100 semi-bold" orientation="horizontal">
                <MinusOutlined aria-hidden={true} />
                <div>{question.libelle}</div>
              </Space>

              {question.reponse?.piecesJustificatives?.map((pj) => (
                <QuestionFileItem key={pj} file={{ uid: pj, name: pj, status: "done", url: pj }} />
              ))}
              {(!question.reponse?.piecesJustificatives ||
                question.reponse?.piecesJustificatives?.length === 0) && (
                <div className="text-legende">Aucune pièce justificative</div>
              )}
            </div>
          </List.Item>
        ))}
      </List>
    </div>
  );
}
