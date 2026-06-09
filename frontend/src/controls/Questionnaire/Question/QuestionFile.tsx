/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { QuestionnaireQuestion, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { Alert, Form, Space, Upload, UploadFile } from "antd";
import { MinusOutlined, UploadOutlined } from "@ant-design/icons";
import { QuestionAide } from "@controls/Questionnaire/Question/QuestionAide";
import { useEffect } from "react";
import { QuestionFileItem } from "@controls/Questionnaire/Question/QuestionFileItem";
import { RcFile } from "antd/es/upload";
import { MAX_FILE_SIZE } from "@/constants";
import { env } from "@/env";
import { useQuestionFileUpload } from "@controls/Questionnaire/Question/useQuestionFileUpload";

export function QuestionFile(props: { question: QuestionnaireQuestion }) {
  const { mode, form } = useQuestionnaire();
  const { fileList, setFileList, removeFile, uploadProps } = useQuestionFileUpload(props.question);

  useEffect(() => {
    if (form) {
      form.setFieldValue(props.question["@id"], fileList);
    }
  }, [fileList, form, props.question]);

  if (mode === "preview" && !props.question.reponse?.piecesJustificatives) {
    return (
      <Form.Item
        label={
          <Space className="question" orientation="horizontal">
            <MinusOutlined aria-hidden={true} />
            <div>{props.question.libelle}</div>
          </Space>
        }
        className="mb-0 w-100 questionnaire-file question-file-preview"
      >
        <Alert description="Aucun fichier déposé" type="info" showIcon />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      className={`mb-0 w-100 questionnaire-file ${
        mode === "preview" ? "question-file-preview" : ""
      }`}
      rules={
        mode !== "preview"
          ? [
              {
                validator: async (_, value: (UploadFile | string)[]) => {
                  if (value && value.length > 0) {
                    if (
                      value.some(
                        (f) =>
                          typeof f === "object" && (f as RcFile).size > MAX_FILE_SIZE * 1024 * 1024,
                      )
                    ) {
                      setFileList(fileList.filter((f) => f.status === "done"));
                      return Promise.reject(
                        new Error(
                          `Le fichier dépasse la taille maximum autorisée (${MAX_FILE_SIZE} Mo).`,
                        ),
                      );
                    }

                    if (
                      props.question.obligatoire &&
                      !value.some(
                        (f) =>
                          (typeof f === "object" &&
                            (f.status === "done" || f.status === "uploading")) ||
                          (typeof f === "string" &&
                            f.startsWith(`${env.REACT_APP_API_PREFIX}/telechargements/`)),
                      )
                    ) {
                      return Promise.reject(
                        new Error(`Le fichier n'a pas pu être chargé, veuillez réessayer.`),
                      );
                    }

                    return Promise.resolve();
                  } else if (props.question.obligatoire) {
                    return Promise.reject(new Error("Vous devez déposer un fichier."));
                  }
                },
              },
            ]
          : []
      }
      required={props.question.obligatoire}
      rootClassName="question-item"
      getValueFromEvent={(e) => {
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList;
      }}
      getValueProps={() => {
        return {
          fileList: fileList.filter((f) => f.status === "done" || f.status === "uploading"),
        };
      }}
      label={
        <Space className="question" orientation="horizontal">
          <MinusOutlined aria-hidden={true} />
          <div>{props.question.libelle}</div>
        </Space>
      }
      name={props.question["@id"]}
      valuePropName="fileList"
    >
      <Upload.Dragger
        {...uploadProps}
        aria-label={`Déposer un fichier pour : ${props.question.libelle}`}
        itemRender={(_originNode, file) => (
          <QuestionFileItem
            file={file}
            onRemove={(pieceJustificativeId) => removeFile(pieceJustificativeId)}
          />
        )}
      >
        <div className="ant-upload-drag-icon mt-1 mb-2">
          <UploadOutlined className="text-primary" style={{ fontSize: 40 }} aria-hidden />
        </div>
        <div className="ant-upload-text">
          Cliquez ou déposez ici un fichier pour le charger ({MAX_FILE_SIZE} Mo maximum).
        </div>
        <div className="ant-upload-hint mt-2">
          {props.question.aide ? (
            <QuestionAide question={props.question} />
          ) : (
            <p>
              Pour s'assurer du bon traitement de votre demande, merci de vérifier que le fichier
              est conforme et bien lisible.
            </p>
          )}
        </div>
        {props.question.choixMultiple ? (
          <div className="legende">Vous pouvez déposer plusieurs fichiers.</div>
        ) : (
          <div className="legende">Vous ne pouvez déposer qu'un seul fichier.</div>
        )}
      </Upload.Dragger>
    </Form.Item>
  );
}
