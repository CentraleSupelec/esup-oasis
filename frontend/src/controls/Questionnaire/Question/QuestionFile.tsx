/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

import {
    QuestionnaireQuestion,
    useQuestionnaire,
} from "../../../context/demande/QuestionnaireProvider";
import {Alert, App, Form, Space, Upload, UploadFile, UploadProps} from "antd";
import {MinusOutlined, UploadOutlined} from "@ant-design/icons";
import {QuestionAide} from "./QuestionAide";
import {useEffect, useState} from "react";
import {QuestionFileItem} from "./QuestionFileItem";
import {RcFile} from "antd/es/upload";
import {MAX_FILE_SIZE} from "../../../constants";
import {envoyerFichierFetch} from "../../../utils/upload";
import {useAuth} from "../../../auth/AuthProvider";
import Spinner from "../../Spinner/Spinner";
import {env} from "../../../env";

export function QuestionFile(props: { question: QuestionnaireQuestion }) {
    const {mode, form, questUtils, setSubmitting} = useQuestionnaire();
    const auth = useAuth();
    const {notification} = App.useApp();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);

    useEffect(() => {
        setFileList(
            props.question.reponse?.piecesJustificatives?.map((pj) => {
                return {
                    uid: pj,
                    name: "...",
                    status: "done",
                    url: pj,
                };
            }) || [],
        );
    }, [props.question.reponse?.piecesJustificatives]);

    function envoyerReponse(
        pieceJustificativeId: string,
        reponse: string[],
        onSuccess: ((body: string) => void) | undefined,
        setNewFileList: () => void,
    ) {
        questUtils?.envoyerReponse(props.question["@id"] as string, "file", reponse, () => {
            onSuccess?.("ok");
            setNewFileList();
        });
    }

    function removeFile(pieceJustificativeId: string) {
        envoyerReponse(
            pieceJustificativeId,
            props.question.reponse?.piecesJustificatives?.filter(
                (pj) => pj !== pieceJustificativeId,
            ) || [],
            () => {
                setFileList((prev) => {
                    return prev.filter((f) => f.uid !== pieceJustificativeId);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form?.resetFields([props.question["@id"] as any]);
            },
            () =>
                setFileList((prev) => {
                    return prev.filter((f) => f.uid !== pieceJustificativeId);
                }),
        );
    }

    const uploadProps: UploadProps = {
        name: "file",
        fileList: fileList,
        multiple: false,
        disabled: mode === "preview",
        customRequest: async (options) => {
            const {onSuccess, onError, file} = options;

            if (!file) {
                return;
            }

            if (typeof file === "object" && (file as RcFile).size > MAX_FILE_SIZE * 1024 * 1024) {
                notification.error({
                    message: `Le fichier "${props.question.libelle}" dépasse la taille maximum autorisée (${MAX_FILE_SIZE} Mo).`,
                    icon: <UploadOutlined className="text-danger" aria-hidden/>,
                });
                return;
            }

            // envoi du fichier
            setUploading(true);
            setSubmitting(true);
            await envoyerFichierFetch(
                env.REACT_APP_API as string,
                auth,
                file,
                (pj) => {
                    // envoi de la réponse avec l'ID du fichier
                    envoyerReponse(
                        pj["@id"] as string,
                        props.question.choixMultiple
                            ? [
                                ...(props.question.reponse?.piecesJustificatives || []),
                                pj["@id"] as string,
                            ]
                            : [pj["@id"] as string],
                        onSuccess,
                        () =>
                            setFileList((prev) => {
                                setUploading(false);
                                setSubmitting(false);

                                notification.success({
                                    message: `Le fichier a été chargé.`,
                                    icon: <UploadOutlined className="text-success" aria-hidden/>,
                                });

                                // mise à jour du statut du fichier
                                return prev.map((f) => {
                                    if (f.uid === (options.file as RcFile).uid) {
                                        return {
                                            uid: pj["@id"] as string,
                                            name: f.name,
                                            status: "done",
                                            url: pj["@id"] as string,
                                        };
                                    }
                                    return f;
                                });
                            }),
                    );
                },
                (error) => {
                    setFileList((prev) => {
                        notification.error({
                            message: `Erreur lors du chargement du fichier.`,
                            icon: <UploadOutlined className="text-danger" aria-hidden/>,
                        });

                        // mise à jour de l'état du fichier
                        return prev.map((f) => {
                            setUploading(false);
                            setSubmitting(false);
                            if (f.uid === (options.file as RcFile).uid) {
                                return {
                                    uid: f.uid,
                                    name: f.name,
                                    status: "error",
                                    percent: undefined,
                                };
                            }
                            return f;
                        });
                    });
                    onError?.(error);
                },
            );
        },

        onChange(info) {
            const {status, originFileObj} = info.file;
            if (status === "uploading") {
                if (originFileObj) {
                    if (!fileList.some((f) => f.uid === originFileObj.uid)) {
                        // ajout du fichier à la liste
                        setFileList((prev) => [...prev, originFileObj]);
                    }
                }
            }
        },

        itemRender: (_originNode, file) => {
            return (
                <QuestionFileItem
                    file={file}
                    onRemove={(pieceJustificativeId) => removeFile(pieceJustificativeId)}
                />
            );
        },
    };

    useEffect(() => {
        if (form) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setFieldValue(props.question["@id"] as any, fileList);
        }
    }, [fileList, form, props.question]);

    return (
        <>
            {mode === "preview" && !props.question.reponse?.piecesJustificatives ? (
                <Form.Item
                    label={
                        <Space className="question" direction="horizontal">
                            <MinusOutlined aria-hidden={true}/>
                            <div>{props.question.libelle}</div>
                        </Space>
                    }
                    className="mb-0 w-100 questionnaire-file question-file-preview"
                >
                    <Alert description="Aucun fichier déposé" type="info" showIcon/>
                </Form.Item>
            ) : (
                <Form.Item
                    className={`mb-0 w-100 questionnaire-file ${
                        mode === "preview" ? "question-file-preview" : ""
                    }`}
                    rules={
                        mode !== "preview"
                            ? [
                                props.question.obligatoire
                                    ? {
                                        validator: async (_, value) => {
                                            if (value && value.length > 0) {
                                                if (
                                                    value.some(
                                                        (f: RcFile) => f.size > MAX_FILE_SIZE * 1024 * 1024,
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
                                                    value &&
                                                    !value.some(
                                                        (f: RcFile | string) =>
                                                            typeof f === "object" &&
                                                            // @ts-ignore
                                                            (f?.status === "done" ||
                                                                // @ts-ignore
                                                                f?.status === "uploading"),
                                                    ) &&
                                                    !value.some(
                                                        (f: string | RcFile) =>
                                                            typeof f === "string" &&
                                                            f.startsWith(`${env.REACT_APP_API_PREFIX}/telechargements/`),
                                                    )
                                                ) {
                                                    return Promise.reject(
                                                        new Error(
                                                            `Le fichier n'a pas pu être chargé, veuillez réessayer.`,
                                                        ),
                                                    );
                                                }

                                                return Promise.resolve();
                                            } else {
                                                return Promise.reject(
                                                    new Error("Vous devez déposer un fichier."),
                                                );
                                            }
                                        },
                                    }
                                    : {
                                        validator: async (_, value) => {
                                            if (value && value.length > 0) {
                                                if (
                                                    value.some(
                                                        (f: RcFile) => f.size > MAX_FILE_SIZE * 1024 * 1024,
                                                    )
                                                ) {
                                                    setFileList(fileList.filter((f) => f.status === "done"));
                                                    return Promise.reject(
                                                        new Error(
                                                            `Le fichier dépasse la taille maximum autorisée (${MAX_FILE_SIZE} Mo)`,
                                                        ),
                                                    );
                                                }
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
                            fileList: fileList.filter(
                                (f) => f.status === "done" || f.status === "uploading",
                            ),
                        };
                    }}
                    label={
                        <Space className="question" direction="horizontal">
                            <MinusOutlined aria-hidden={true}/>
                            <div>{props.question.libelle}</div>
                        </Space>
                    }
                    name={props.question["@id"]}
                    valuePropName="fileList"
                >
                    {uploading ? (
                        <Space>
                            <Spinner/>
                            <span className="text-legende">Le fichier est en cours de chargement...</span>
                        </Space>
                    ) : (
                        <Upload.Dragger {...uploadProps}>
                            <div className="ant-upload-drag-icon mt-1 mb-2">
                                <UploadOutlined
                                    className="text-primary"
                                    style={{fontSize: 40}}
                                    aria-hidden
                                />
                            </div>
                            <div className="ant-upload-text">
                                Cliquez ou déposez ici un fichier pour le charger ({MAX_FILE_SIZE} Mo
                                maximum).
                            </div>
                            <div className="ant-upload-hint mt-2">
                                {props.question.aide ? (
                                    <QuestionAide question={props.question}/>
                                ) : (
                                    <p>
                                        Pour s'assurer du bon traitement de votre demande, merci de vérifier
                                        que le fichier est conforme et bien lisible.
                                    </p>
                                )}
                            </div>
                            {props.question.choixMultiple ? (
                                <div className="legende">Vous pouvez déposer plusieurs fichiers.</div>
                            ) : (
                                <div className="legende">Vous ne pouvez déposer qu'un seul fichier.</div>
                            )}
                        </Upload.Dragger>
                    )}
                </Form.Item>
            )}
        </>
    );
}
