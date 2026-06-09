/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { InfoCircleOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { QuestionnaireQuestion } from "@context/demande/QuestionnaireProvider";
import { sanitizeHtml } from "@utils/sanitize";

export function QuestionAide(props: { question: QuestionnaireQuestion }) {
  return (
    props.question.aide && (
      <Space className="question-aide">
        <InfoCircleOutlined aria-hidden />
        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.question.aide as string) }} />
      </Space>
    )
  );
}
