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
import { IClubSportif, QK_CLUBS_SPORTIFS } from "@api";

interface ClubsSportifsEditionProps {
  editedItem?: IClubSportif;
  setEditedItem: (item: IClubSportif | undefined) => void;
}

/**
 * Handles the creation or update of a clubSportife.
 *
 * @param {ClubsSportifsEditionProps} props - The component props.
 * @param {IClubSportif} [props.editedItem] - The item being edited.
 * @param {function} props.setEditedItem - The function to set the edited item.
 * @returns {ReactElement} - The rendered component.
 */
export function ClubSportifEdition({
  editedItem,
  setEditedItem,
}: ClubsSportifsEditionProps): ReactElement {
  const [form] = Form.useForm();

  const mutationPost = useApi().usePost({
    path: "/clubs_sportifs",
    invalidationQueryKeys: [QK_CLUBS_SPORTIFS],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/clubs_sportifs/{id}`,
    invalidationQueryKeys: [QK_CLUBS_SPORTIFS],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  function createOrUpdate(values: IClubSportif) {
    if (!editedItem) return;

    if (editedItem["@id"] === undefined) {
      // Création
      mutationPost?.mutate({
        data: {
          ...values,
          centreFormation: values.centreFormation || false,
          professionnel: values.professionnel || false,
        },
      });
    } else {
      // Modification
      mutationPatch?.mutate({
        "@id": editedItem["@id"],
        data: {
          centreFormation: false,
          professionnel: false,
          ...values,
        },
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
      title={editedItem?.["@id"] ? "Éditer un club sportif" : "Ajouter un club sportif"}
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Card
        title="Club sportif"
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
          <Form.Item name="actif" label="Actif" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="centreFormation" label="Centre de formation" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="professionnel" label="Professionnel" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
}
