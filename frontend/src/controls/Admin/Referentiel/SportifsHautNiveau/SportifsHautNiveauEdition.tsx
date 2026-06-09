/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Card, Divider, Drawer, Form, Input, InputNumber } from "antd";
import { useApi } from "@context/api/ApiProvider";
import React, { ReactElement, useEffect } from "react";
import { ISportifHautNiveau, QK_SPORTIFS_HAUT_NIVEAU } from "@api";

interface SportifsHautNiveauEditionProps {
  editedItem?: ISportifHautNiveau;
  setEditedItem: (item: ISportifHautNiveau | undefined) => void;
}

/**
 * Handles the creation or update of a clubSportife.
 *
 * @returns {ReactElement} - The rendered component.
 */
export function SportifsHautNiveauEdition({
  editedItem,
  setEditedItem,
}: SportifsHautNiveauEditionProps): ReactElement {
  const [form] = Form.useForm();

  const mutationPost = useApi().usePost({
    path: "/sportifs_haut_niveau",
    invalidationQueryKeys: [QK_SPORTIFS_HAUT_NIVEAU],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/sportifs_haut_niveau/{identifiantExterne}`,
    invalidationQueryKeys: [QK_SPORTIFS_HAUT_NIVEAU],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  function createOrUpdate(values: ISportifHautNiveau) {
    if (!editedItem) return;

    if (editedItem["@id"] === undefined) {
      // Création
      mutationPost?.mutate({
        data: values as ISportifHautNiveau,
      });
    } else {
      // Modification
      mutationPatch?.mutate({
        "@id": editedItem["@id"],
        data: {
          ...values,
          identifiantExterne: undefined,
        } as ISportifHautNiveau,
      });
    }
  }

  // Synchronisation editedItem / form
  useEffect(() => {
    if (editedItem && editedItem["@id"]) {
      form.setFieldsValue(editedItem);
    }
  }, [editedItem, form]);

  useEffect(() => {
    if (editedItem) {
      form.setFieldsValue(editedItem);
    }
  }, [editedItem, form]);

  return (
    <Drawer
      className="bg-light-grey"
      open
      title={
        editedItem?.["@id"] ? "Éditer un sportif haut niveau" : "Ajouter un sportif haut niveau"
      }
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Card
        title="Sportif haut niveau"
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
          <Form.Item
            name="identifiantExterne"
            label="Identifiant sportif"
            rules={[{ required: true }]}
            required
            help={
              <span className="legende">
                Numéro PSQS : cette information n'est pas éditable, il faut créer un nouveau sportif
                si besoin.
              </span>
            }
          >
            <Input disabled={editedItem?.identifiantExterne !== undefined} />
          </Form.Item>

          <Divider />
          <Form.Item name="nom" label="Nom">
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="prenom" label="Prénom">
            <Input />
          </Form.Item>
          <Form.Item
            name="anneeNaissance"
            label="Année de naissance"
            rules={[{ required: true }]}
            required
          >
            <InputNumber precision={0} min={1900} max={2100} />
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
}
