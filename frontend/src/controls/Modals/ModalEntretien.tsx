/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IEntretien, QK_UTILISATEURS_ENTRETIENS } from "@api";
import { App, Button, Col, DatePicker, Form, Input, Modal, Row } from "antd";
import { useApi } from "@context/api/ApiProvider";
import React, { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Fichier } from "@controls/Fichier/Fichier";
import { FichierDepot } from "@controls/Fichier/FichierDepot";

type IEntretienForm = IEntretien & { dateJs: Dayjs };

export function ModalEntretien(props: {
  entretienId?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  utilisateurId?: string;
  setEditedItem: (item: IEntretien) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm<IEntretienForm>();
  const { data: entretien, isFetching } = useApi().useGetItem({
    path: "/utilisateurs/{uid}/entretiens/{id}",
    url: props.entretienId,
    enabled: !!props.entretienId,
  });

  const mutatePostEntretien = useApi().usePost({
    path: "/utilisateurs/{uid}/entretiens",
    url: `${props.utilisateurId}/entretiens`,
    invalidationQueryKeys: [QK_UTILISATEURS_ENTRETIENS],
  });
  const mutatePatchEntretien = useApi().usePatch({
    path: "/utilisateurs/{uid}/entretiens/{id}",
    invalidationQueryKeys: [QK_UTILISATEURS_ENTRETIENS, props.entretienId as string],
  });

  function handleSubmit(values: IEntretienForm, close = true) {
    const data = {
      date: values.dateJs?.format("YYYY-MM-DD") || null,
      commentaire: values.commentaire || null,
      fichier: values.fichier || null,
    } as IEntretien;
    if (props.entretienId) {
      mutatePatchEntretien.mutate(
        {
          "@id": props.entretienId,
          data,
        },
        {
          onSuccess: () => {
            message.success("Entretien modifié").then();
            if (close) props.setOpen(false);
          },
        },
      );
    } else {
      mutatePostEntretien.mutate(
        {
          data,
        },
        {
          onSuccess: (nouveau) => {
            message.success("Entretien ajouté").then();
            props.setEditedItem(nouveau);
            if (close) props.setOpen(false);
          },
        },
      );
    }
  }

  useEffect(() => {
    if (entretien) {
      form.resetFields();
      form.setFieldsValue({
        ...entretien,
        dateJs: dayjs(entretien.date),
      });
    }
  }, [form, entretien]);

  function supprimerFichierEntretien() {
    mutatePatchEntretien.mutate({
      "@id": props.entretienId as string,
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
      okText={props.entretienId ? "Valider" : "Ajouter"}
      cancelText="Annuler"
      title={props.entretienId ? "Éditer un entretien" : "Ajouter un entretien"}
      width={700}
    >
      <Form<IEntretienForm>
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ dateJs: dayjs(), ...entretien }}
        className="mb-2"
      >
        <Row>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Date"
              name="dateJs"
              required
              rules={[
                {
                  required: true,
                  message: "Veuillez renseigner une date",
                },
              ]}
            >
              <DatePicker className="text-center" picker="date" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="commentaire" label="Commentaire">
          <Input.TextArea autoSize style={{ minHeight: 100 }} />
        </Form.Item>
        {entretien?.["@id"] && (
          <Form.Item name="fichier" label="Fichier lié">
            {entretien?.fichier ? (
              <Fichier
                fichierId={entretien?.fichier}
                onRemove={() => supprimerFichierEntretien()}
                loading={isFetching}
              />
            ) : (
              <FichierDepot
                onAdded={(fichier) => {
                  mutatePatchEntretien.mutate({
                    "@id": props.entretienId as string,
                    data: {
                      fichier: fichier["@id"],
                    },
                  });
                }}
              />
            )}
          </Form.Item>
        )}
        {!entretien?.["@id"] && (
          <div className="text-center">
            <Button
              className="w-100"
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
