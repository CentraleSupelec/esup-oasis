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
import React, { ReactElement, useEffect } from "react";
import { ICategorieAmenagement, QK_CATEGORIES_AMENAGEMENTS } from "@api";

interface AmenagementsEditionProps {
  editedItem?: ICategorieAmenagement;
  setEditedItem: (item: ICategorieAmenagement | undefined) => void;
}

interface IAmenagementForm {
  libelle: string;
  actif: boolean;
}

/**
 * Handles the creation or update of an amenagement.
 *
 * @param {AmenagementsEditionProps} props - The component props.
 * @param {ICategorieAmenagement} [props.editedItem] - The item being edited.
 * @param {function} props.setEditedItem - The function to set the edited item.
 * @returns {ReactElement} - The rendered component.
 */
export function CategorieAmenagementEdition({
  editedItem,
  setEditedItem,
}: AmenagementsEditionProps): ReactElement {
  const [form] = Form.useForm();

  const mutationPost = useApi().usePost({
    path: "/categories_amenagements",
    invalidationQueryKeys: [QK_CATEGORIES_AMENAGEMENTS],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/categories_amenagements/{id}`,
    invalidationQueryKeys: [QK_CATEGORIES_AMENAGEMENTS],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  function createOrUpdate(values: IAmenagementForm) {
    if (!editedItem) return;

    if (editedItem["@id"] === undefined) {
      // Création
      mutationPost?.mutate({ data: values });
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

  useEffect(() => {
    if (editedItem && editedItem["@id"]) {
      form.setFieldsValue(editedItem);
    }
  }, [editedItem, form]);

  return (
    <Drawer
      className="bg-light-grey"
      open
      title={
        editedItem?.["@id"]
          ? "Éditer une catégorie d'aménagement"
          : "Ajouter une catégorie d'aménagement"
      }
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Card
        title="Catégorie d'aménagement"
        actions={[
          <Button onClick={() => setEditedItem(undefined)}>Annuler</Button>,
          <Button type="primary" onClick={form.submit}>
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
          <Form.Item name="actif" label="Actif" className="mt-2" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
}
