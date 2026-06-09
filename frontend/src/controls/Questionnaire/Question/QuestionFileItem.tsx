/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Flex, Progress, Space, UploadFile } from "antd";
import { ExclamationCircleFilled, FileOutlined } from "@ant-design/icons";
import { useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { Fichier } from "@controls/Fichier/Fichier";

export function QuestionFileItem(props: {
  file: UploadFile;
  onRemove?: (pieceJustificativeId: string) => void;
}) {
  const { mode } = useQuestionnaire();
  const { data: pieceJustificative, isFetching } = useApi().useGetItem({
    path: "/telechargements/{id}",
    url: props.file.uid,
    enabled: !!props.file.uid && props.file.status === "done",
  });

  function getIcon() {
    if (isFetching || props.file.status === "uploading") {
      return <Spinner size={16} />;
    } else if (props.file.status === "error") {
      return (
        <ExclamationCircleFilled
          aria-label="Erreur dans le chargement de la pièce justificative"
          className="text-danger"
        />
      );
    } else {
      return <FileOutlined />;
    }
  }

  return (
    <div className={`question-file-item w-100 ${!pieceJustificative ? "text-legende" : ""}`}>
      {props.file.status === "done" && !isFetching ? (
        <Fichier
          fichierId={props.file.uid as string}
          onRemove={mode === "saisie" ? props.onRemove : undefined}
        />
      ) : (
        <Flex justify="space-between" align="center" wrap="wrap" className="w-100" gap={16}>
          <Space style={{ width: "50%" }}>
            {getIcon()}
            <span>{pieceJustificative?.nom || props.file.name}</span>
          </Space>
          {props.file.status === "uploading" && props.file.percent !== undefined && (
            <Progress
              className="mb-0"
              type="line"
              percent={Math.round(props.file.percent)}
              size={["50%", 10]}
            />
          )}
          {props.file.status === "uploading" && props.file.percent === undefined && (
            <span>Chargement du fichier ${props.file.name}</span>
          )}
        </Flex>
      )}
    </div>
  );
}
