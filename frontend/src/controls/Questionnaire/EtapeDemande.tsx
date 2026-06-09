/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Question } from "@controls/Questionnaire/Question/Question";
import { QuestionnaireEtape, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { Alert, Divider } from "antd";
import { ExclamationOutlined } from "@ant-design/icons";
import Spinner from "@controls/Spinner/Spinner";

export function EtapeDemande(props: { etapeIndex: number }): React.ReactElement {
  const { questionnaire } = useQuestionnaire();
  const etape: QuestionnaireEtape | undefined = (questionnaire?.etapes || [])[props.etapeIndex];

  if (!questionnaire) return <Spinner />;

  if (!etape) {
    return (
      <Alert
        type="error"
        icon={<ExclamationOutlined />}
        showIcon
        title="Erreur"
        description="Erreur lors de la récupération de l'étape."
      />
    );
  }

  return (
    <>
      <h2 id="etape-title" tabIndex={0}>
        <span className="sr-only">Étape actuelle : </span>
        {etape.libelle}
      </h2>
      <div className="ml-2 mr-2">
        {etape.questions?.map((question) => {
          return typeof question === "string" ? (
            <div key={question}>
              <Question questionId={question} />
              <Divider />
            </div>
          ) : (
            <div key={question["@id"]}>
              <Question question={question} />
              <Divider />
            </div>
          );
        })}
      </div>
    </>
  );
}
