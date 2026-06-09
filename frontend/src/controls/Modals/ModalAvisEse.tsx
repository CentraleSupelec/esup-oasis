/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  IAvisEse,
  QK_BENEFICIAIRES,
  QK_UTILISATEURS_AVIS_ESE,
  QK_UTILISATEURS_AVIS_ESE_ITEM,
} from "@api";
import { App, Button, Col, DatePicker, Form, Input, Modal, Row } from "antd";
import { useApi } from "@context/api/ApiProvider";
import React, { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Fichier } from "@controls/Fichier/Fichier";
import { FichierDepot } from "@controls/Fichier/FichierDepot";
import { env } from "@/env";

type IAvisForm = IAvisEse & { dateDebut: Dayjs; dateFin: Dayjs | null };

export function ModalAvisEse(props: {
  avisId?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  utilisateurId?: string;
  setEditedItem: (item: IAvisEse) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm<IAvisForm>();
  const { data: avis, isFetching } = useApi().useGetItem({
    path: "/utilisateurs/{uid}/avis_ese/{id}",
    url: props.avisId,
    enabled: !!props.avisId,
  });

  const mutatePostAvis = useApi().usePost({
    path: "/utilisateurs/{uid}/avis_ese",
    url: `${props.utilisateurId}/avis_ese`,
    invalidationQueryKeys: [
      QK_UTILISATEURS_AVIS_ESE,
      QK_UTILISATEURS_AVIS_ESE_ITEM,
      props.utilisateurId as string,
      QK_BENEFICIAIRES,
    ],
  });
  const mutatePatchAvis = useApi().usePatch({
    path: "/utilisateurs/{uid}/avis_ese/{id}",
    invalidationQueryKeys: [
      QK_UTILISATEURS_AVIS_ESE,
      props.avisId as string,
      props.utilisateurId as string,
      QK_BENEFICIAIRES,
    ],
  });

  function handleSubmit(values: IAvisForm, close = true) {
    const data = {
      debut: values.dateDebut.format("YYYY-MM-DD") || null,
      fin: values.dateFin ? values.dateFin.format("YYYY-MM-DD") : null,
      commentaire: values.commentaire || null,
      fichier: values.fichier || null,
      libelle: values.libelle || null,
    } as IAvisEse;
    if (props.avisId) {
      mutatePatchAvis.mutate(
        {
          "@id": props.avisId,
          data,
        },
        {
          onSuccess: () => {
            message.success("Avis modifié").then();
            if (close) props.setOpen(false);
          },
        },
      );
    } else {
      mutatePostAvis.mutate(
        {
          data,
        },
        {
          onSuccess: (nouveau) => {
            message.success("Avis ajouté").then();
            props.setEditedItem(nouveau);
            if (close) props.setOpen(false);
          },
        },
      );
    }
  }

  useEffect(() => {
    if (avis) {
      form.resetFields();
      form.setFieldsValue({
        ...avis,
        dateDebut: dayjs(avis.debut),
        dateFin: avis.fin ? dayjs(avis.fin) : null,
      });
    }
  }, [form, avis]);

  function supprimerFichierEse() {
    mutatePatchAvis.mutate({
      "@id": props.avisId as string,
      data: {
        fichier: null,
      },
    });
  }

  return (
    <Modal
      open={props.open}
      onCancel={() => props.setOpen(false)}
      onOk={() => {
        form.submit();
      }}
      okText={props.avisId ? "Valider" : "Ajouter"}
      cancelText="Annuler"
      title={
        props.avisId
          ? `Éditer un avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`
          : `Ajouter un avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`
      }
      width={700}
    >
      <Form<IAvisForm>
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={avis}
        className="mb-2"
      >
        <Row>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Libellé"
              name="libelle"
              required
              rules={[{ required: true, message: "Le libellé est requis" }]}
            >
              <Input />
            </Form.Item>
            <Row>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="dateDebut"
                  label="Date de début"
                  required
                  rules={[{ required: true, message: "La date de début est requise" }]}
                >
                  <DatePicker className="text-center w-100" picker="date" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="dateFin"
                  label="Date de fin"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (
                          value &&
                          form.getFieldValue("dateDebut") &&
                          value.isBefore(form.getFieldValue("dateDebut"))
                        ) {
                          return Promise.reject(
                            "La date de fin doit être postérieure à la date de début",
                          );
                        }
                      },
                    },
                  ]}
                >
                  <DatePicker
                    className="text-center w-100"
                    picker="date"
                    format="DD/MM/YYYY"
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Form.Item name="commentaire" label="Commentaire">
          <Input.TextArea autoSize style={{ minHeight: 100 }} />
        </Form.Item>
        {avis?.["@id"] && (
          <Form.Item name="fichier" label="Fichier lié">
            {avis?.fichier ? (
              <Fichier
                fichierId={avis?.fichier}
                onRemove={() => supprimerFichierEse()}
                loading={isFetching}
              />
            ) : (
              <FichierDepot
                onAdded={(fichier) => {
                  mutatePatchAvis.mutate({
                    "@id": props.avisId as string,
                    data: {
                      fichier: fichier["@id"],
                    },
                  });
                }}
              />
            )}
          </Form.Item>
        )}
        {!avis?.["@id"] && (
          <div className="text-center">
            <Button
              type="dashed"
              onClick={async () => {
                try {
                  await form.validateFields();
                  handleSubmit(form.getFieldsValue(), false);
                } catch {
                  // validation échouée : Ant Design affiche les erreurs dans le formulaire
                }
              }}
            >
              Ajouter un document
            </Button>
          </div>
        )}
      </Form>
    </Modal>
  );
}
