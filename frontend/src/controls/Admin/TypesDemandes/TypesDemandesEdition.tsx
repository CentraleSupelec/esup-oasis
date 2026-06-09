/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Card, Divider, Drawer, Form, Input, Select, Switch } from "antd";
import React, { ReactElement, useEffect } from "react";
import { ITypeDemande, PREFETCH_PROFILS, QK_TYPES_DEMANDES } from "@api";
import { useApi } from "@context/api/ApiProvider";
import { BENEFICIAIRE_PROFIL_A_DETERMINER } from "@/constants";

interface TypesDemandesEditionProps {
  editedItem?: ITypeDemande;
  setEditedItem: (item: ITypeDemande | undefined) => void;
}

/**
 * Handles the creation or update of a profile.
 *
 * @param {TypesDemandesEditionProps} props - The component props.
 * @param {IProfil} [props.editedItem] - The item being edited.
 * @param {function} props.setEditedItem - The function to set the edited item.
 * @returns {ReactElement} - The rendered component.
 */
export function TypesDemandesEdition({
  editedItem,
  setEditedItem,
}: TypesDemandesEditionProps): ReactElement {
  const [form] = Form.useForm();
  const { data: profils, isFetching } = useApi().useGetFullCollection(PREFETCH_PROFILS);

  const mutationPost = useApi().usePost({
    path: "/types_demandes",
    invalidationQueryKeys: [QK_TYPES_DEMANDES],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/types_demandes/{id}`,
    invalidationQueryKeys: [QK_TYPES_DEMANDES],
    onSuccess: () => {
      setEditedItem(undefined);
    },
  });

  function createOrUpdate(values: ITypeDemande) {
    if (!editedItem) return;

    const data = {
      libelle: values.libelle,
      actif: values.actif,
      accompagnementOptionnel: values.accompagnementOptionnel,
      visibiliteLimitee: values.visibiliteLimitee,
      profilsCibles: values.profilsCibles,
    };

    if (editedItem["@id"] === undefined) {
      // Création
      mutationPost?.mutate({
        data,
      });
    } else {
      // Modification
      mutationPatch?.mutate({
        "@id": editedItem["@id"],
        data,
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
      title={editedItem?.["@id"] ? "Éditer un type de demande" : "Ajouter un type de demande"}
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Card
        title="Type de demande"
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
          <Form.Item
            name="profilsCibles"
            label="Profils cibles"
            required
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner un ou plusieurs profils liés à ce type de demande",
              },
              {
                type: "array",
                min: 1,
                message: "Veuillez sélectionner un ou plusieurs profils liés à ce type de demande",
              },
            ]}
          >
            <Select
              loading={isFetching}
              options={profils?.items
                .filter((p) => p["@id"] !== BENEFICIAIRE_PROFIL_A_DETERMINER && p.actif)
                .map((p) => ({ label: p.libelle, value: p["@id"] }))}
              mode="tags"
            />
          </Form.Item>
          <Divider />
          <Form.Item
            name="visibiliteLimitee"
            label="Visibilité limitée"
            valuePropName="checked"
            help="Afin de masquer les demandes aux renforts"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="accompagnementOptionnel"
            label="Accompagnement optionnel"
            valuePropName="checked"
            className="mt-2"
            help="Permet d'avoir une attribution de profil sans accompagnement"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
}
