/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Modal } from "antd";
import React from "react";
import { QuestionnaireProvider } from "@context/demande/QuestionnaireProvider";
import { TypeDemandeContent } from "@controls/Questionnaire/TypeDemandeContent";

export default function QuestionnaireModale(props: {
  typeDemandeId: string | undefined;
  setTypeDemandeId: (typeDemandeId: string | undefined) => void;
}) {
  if (!props.typeDemandeId) return null;

  return (
    <Modal
      open={!!props.typeDemandeId}
      centered
      width="90%"
      title="Aperçu du questionnaire"
      onCancel={() => props.setTypeDemandeId(undefined)}
      onOk={() => props.setTypeDemandeId(undefined)}
      cancelButtonProps={{ style: { display: "none" } }}
      okText="Fermer"
    >
      <QuestionnaireProvider typeDemandeId={props.typeDemandeId} mode="preview">
        <TypeDemandeContent />
      </QuestionnaireProvider>
    </Modal>
  );
}
