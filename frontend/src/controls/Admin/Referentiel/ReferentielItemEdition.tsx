/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Card, Drawer, Form, Input, Switch } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { APIPathsReferentiel } from "@api";
import React, { ReactElement, useEffect } from "react";
import Spinner from "@controls/Spinner/Spinner";
import { IReferentielEditable } from "@lib";
import { SaveOutlined } from "@ant-design/icons";
import { AdminConfig } from "@routes/administration/AdminConfig";

interface ReferentielItemEditionProps {
  referentielConfig: AdminConfig;
  editedItem: IReferentielEditable | undefined;
  setEditedItem: (item: IReferentielEditable | undefined) => void;
}

/**
 * Edit or create an item in the referentiel.
 * @param {Object} ReferentielItemEditionProps - Props for the referentiel item edition component.
 * @property {AdminConfig} referentielConfig - The configuration for the referentiel.
 * @property {IReferentielEditable | undefined} editedItem - The item being edited.
 * @property {function} setEditedItem - Function to set the edited item.
 * @returns {ReactElement} - The referentiel item edition component.
 */
export function ReferentielItemEdition({
  referentielConfig,
  editedItem,
  setEditedItem,
}: ReferentielItemEditionProps): ReactElement {
  const [form] = Form.useForm();
  const mutationPost = useApi().usePost({
    path: referentielConfig?.apiPath as APIPathsReferentiel,
    invalidationQueryKeys: [referentielConfig?.apiPath as APIPathsReferentiel],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });
  const mutationPatch = useApi().usePatch({
    path: `${referentielConfig?.apiPath as APIPathsReferentiel}/{id}`,
    invalidationQueryKeys: [referentielConfig?.apiPath as APIPathsReferentiel],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  // --- Gestion de l'édition
  useEffect(() => {
    form.setFieldsValue(editedItem);
  }, [editedItem, form]);

  if (!referentielConfig)
    return (
      <Form form={form}>
        <Spinner />
      </Form>
    );

  function createOrUpdate(values: IReferentielEditable) {
    if (!editedItem || !referentielConfig) return;

    if (editedItem["@id"] === undefined) {
      // Création
      mutationPost?.mutate({
        data: values,
      });
    } else {
      // Modification
      mutationPatch?.mutate({
        "@id": editedItem["@id"],
        data: values,
      });
    }
  }

  return (
    <Drawer
      className="bg-light-grey"
      open={editedItem !== undefined}
      title={
        editedItem?.["@id"]
          ? "Éditer un élément du référentiel"
          : "Ajouter un élément au référentiel"
      }
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Form
        className="w-100"
        form={form}
        layout="vertical"
        onFinish={(values) => {
          createOrUpdate(values);
        }}
        initialValues={editedItem}
      >
        <Card
          title={referentielConfig.title}
          actions={[
            <Button onClick={() => setEditedItem(undefined)}>Annuler</Button>,
            <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
              Enregistrer
            </Button>,
          ]}
        >
          <Form.Item name="libelle" label="Libellé" rules={[{ required: true }]} required>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="actif" label="Actif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Card>
      </Form>
    </Drawer>
  );
}
