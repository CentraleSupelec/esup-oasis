/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import { Button, Card, Form, Input, Switch } from "antd";
import { ICommission, QK_COMMISSIONS } from "@api";
import { useApi } from "@context/api/ApiProvider";

interface CommissionsFormProps {
  editedItem?: ICommission;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CommissionsForm: React.FC<CommissionsFormProps> = ({
  editedItem,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const mutationPost = useApi().usePost({
    path: "/commissions",
    invalidationQueryKeys: [QK_COMMISSIONS],
    onSuccess: () => {
      onSuccess();
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/commissions/{id}`,
    invalidationQueryKeys: [QK_COMMISSIONS],
    onSuccess: () => {
      onSuccess();
    },
  });

  function createOrUpdate(values: ICommission) {
    if (!editedItem) return;
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

  // Synchronisation editedItem / form
  useEffect(() => {
    if (editedItem) {
      form.setFieldsValue(editedItem);
    }
  }, [editedItem, form]);

  return (
    <Card
      title="Commission"
      actions={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button key="save" type="primary" onClick={form.submit}>
          Enregistrer
        </Button>,
      ]}
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
        <Form.Item name="libelle" label="Libellé" rules={[{ required: true }]} required>
          <Input autoFocus />
        </Form.Item>
        <Form.Item name="actif" label="Actif" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Card>
  );
};
