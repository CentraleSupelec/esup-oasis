/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Card, Drawer, Form, Input, Select, Switch } from "antd";
import { useApi } from "@context/api/ApiProvider";
import React, { ReactElement, useEffect } from "react";
import {
  ITag,
  PREFETCH_CATEGORIES_TAGS,
  QK_CATEGORIES_TAGS,
  QK_CATEGORIES_TAGS_ITEMS,
  QK_TAGS,
} from "@api";

interface TagEditionProps {
  editedItem?: ITag;
  setEditedItem: (item: ITag | undefined) => void;
}

/**
 * Handles the creation or update of a clubSportife.
 *
 * @param {TagEditionProps} props - The component props.
 * @param {ITag} [props.editedItem] - The item being edited.
 * @param {function} props.setEditedItem - The function to set the edited item.
 * @returns {ReactElement} - The rendered component.
 */
export function TagEdition({ editedItem, setEditedItem }: TagEditionProps): ReactElement {
  const [form] = Form.useForm();
  const { data: categories } = useApi().useGetFullCollection(PREFETCH_CATEGORIES_TAGS);

  const mutationPost = useApi().usePost({
    path: "/tags",
    invalidationQueryKeys: [QK_TAGS, QK_CATEGORIES_TAGS, QK_CATEGORIES_TAGS_ITEMS],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/tags/{id}`,
    invalidationQueryKeys: [QK_TAGS, QK_CATEGORIES_TAGS, QK_CATEGORIES_TAGS_ITEMS],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  function createOrUpdate(values: ITag) {
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

  useEffect(() => {
    if (editedItem && editedItem["@id"]) {
      form.setFieldsValue(editedItem);
    }
  }, [editedItem, form]);

  return (
    <Drawer
      className="bg-light-grey"
      open
      title={editedItem?.["@id"] ? "Éditer un tag" : "Ajouter un tag"}
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Card
        title="Tag"
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
          <Form.Item name="categorie" label="Catégorie de tag">
            <Select
              disabled
              options={categories?.items.map((c) => ({
                label: c.libelle,
                value: c["@id"],
              }))}
            />
          </Form.Item>
          <Form.Item name="libelle" label="Libellé" rules={[{ required: true }]} required>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="actif" label="Actif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
}
