/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Col, Form, Input, Modal, Row } from "antd";
import { useApi } from "@context/api/ApiProvider";
import React, { useEffect } from "react";
import { Fichier } from "@controls/Fichier/Fichier";
import { FichierDepot } from "@controls/Fichier/FichierDepot";
import { IDocumentBeneficiaire, QK_BENEFICIAIRES_PIECES_JOINTES } from "@api";

type IDocumentForm = IDocumentBeneficiaire;

export function ModalDocument(props: {
  documentId?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  utilisateurId: string;
  setEditedItem: (item: IDocumentBeneficiaire) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm<IDocumentForm>();
  const { data: document, isFetching } = useApi().useGetItem({
    path: "/beneficiaires/{uid}/pieces_jointes/{id}",
    url: props.documentId,
    enabled: !!props.documentId,
  });

  const mutatePostDocument = useApi().usePost({
    path: "/beneficiaires/{uid}/pieces_jointes",
    url: `${props.utilisateurId.replace("/utilisateurs/", "/beneficiaires/")}/pieces_jointes`,
    invalidationQueryKeys: [QK_BENEFICIAIRES_PIECES_JOINTES],
  });

  const mutateDelete = useApi().useDelete({
    path: "/beneficiaires/{uid}/pieces_jointes/{id}",
    invalidationQueryKeys: [QK_BENEFICIAIRES_PIECES_JOINTES],
  });

  function handleSubmit(values: IDocumentForm, close = true) {
    if (props.documentId) {
      // PATCH non autorisé....
    } else {
      mutatePostDocument.mutate(
        {
          data: values,
        },
        {
          onSuccess: (nouveau) => {
            message.success("Document ajouté").then();
            props.setEditedItem(nouveau);
            if (close) props.setOpen(false);
          },
        },
      );
    }
  }

  useEffect(() => {
    if (document) {
      form.resetFields();
      form.setFieldsValue({
        ...document,
      });
    }
  }, [form, document]);

  function supprimerFichierDocument() {
    mutateDelete.mutate({
      "@id": props.documentId as string,
    });
  }

  return (
    <Modal
      open={props.open}
      onCancel={() => props.setOpen(false)}
      onOk={() => {
        form.submit();
      }}
      okText={props.documentId ? "Valider" : "Ajouter"}
      cancelText="Annuler"
      title={props.documentId ? "Éditer un document" : "Ajouter un document"}
      width={700}
    >
      <Form<IDocumentForm>
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={document}
        className="mb-2"
      >
        <Row>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Libellé"
              name="libelle"
              required
              rules={[
                {
                  required: true,
                  message: "Veuillez renseigner un libellé",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="fichier"
          label="Fichier lié"
          required
          rules={[
            {
              required: true,
              message: "Veuillez ajouter un fichier",
            },
          ]}
        >
          {document?.fichier ? (
            <Fichier
              fichierId={document?.fichier}
              onRemove={() => supprimerFichierDocument()}
              loading={isFetching}
            />
          ) : (
            <FichierDepot
              onAdded={(fichier) => {
                form.setFieldValue("fichier", fichier["@id"]);
              }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
