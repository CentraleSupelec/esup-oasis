/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import { Button, Card, Drawer, Form, Input, Switch, Tooltip, Typography } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import ColorPicker from "@controls/ColorPicker/ColorPicker";
import TauxHoraireFormItem from "@controls/Forms/TauxHoraireFormItem";
import { PlusOutlined } from "@ant-design/icons";
import { ITypeEvenement, QK_TYPES_EVENEMENTS } from "@api";

interface TypesEvenementsEditionProps {
  typeEvenement: ITypeEvenement;
  setTypeEvenement: (item: ITypeEvenement | undefined) => void;
}

/**
 * Displays a drawer for editing or adding a type of event to the referentiel.
 *
 * @param {Object} props - The component props.
 * @param {ITypeEvenement} props.typeEvenement - The type of event to edit or undefined when adding a new type of event.
 * @param {Function} props.setTypeEvenement - The function to update the type of event.
 * @returns {ReactElement} The TypesEvenementsEdition component.
 */
export function TypesEvenementsEdition({
  typeEvenement,
  setTypeEvenement,
}: TypesEvenementsEditionProps): ReactElement {
  const [isSavable, setIsSavable] = useState(true);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [form] = Form.useForm();
  const mutationPost = useApi().usePost({
    path: "/types_evenements",
    invalidationQueryKeys: [QK_TYPES_EVENEMENTS],
    onSuccess: () => {
      setTypeEvenement(undefined);
    },
  });

  const mutationPatch = useApi().usePatch({
    path: `/types_evenements/{id}`,
    invalidationQueryKeys: [QK_TYPES_EVENEMENTS],
    onSuccess: () => {
      setTypeEvenement(undefined);
    },
  });

  // Synchronisation editedItem / form
  useEffect(() => {
    form.resetFields();
    if (typeEvenement) {
      form.setFieldsValue(typeEvenement);
    }
  }, [typeEvenement, form]);

  function createOrUpdate(values: ITypeEvenement) {
    if (!typeEvenement) return;

    if (typeEvenement["@id"] === undefined) {
      // Création
      mutationPost?.mutate({
        data: values,
      });
    } else {
      // Modification
      mutationPatch?.mutate({
        "@id": typeEvenement["@id"],
        data: values,
      });
    }
  }

  return (
    <Drawer
      className="bg-light-grey"
      open
      title={
        typeEvenement?.["@id"]
          ? "Éditer un élément du référentiel"
          : "Ajouter un élément au référentiel"
      }
      onClose={() => setTypeEvenement(undefined)}
      size="large"
    >
      <Card
        title="Catégorie d'évènement"
        actions={[
          <Button onClick={() => setTypeEvenement(undefined)}>Annuler</Button>,
          <Button
            type="primary"
            //  disabled={!editedItem?.debut || !editedItem.fin || !editedItem.butoir}
            onClick={form.submit}
            disabled={!isSavable}
          >
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
          initialValues={typeEvenement}
        >
          <Form.Item name="libelle" label="Libellé" rules={[{ required: true }]} required>
            <Input
              disabled={!isSavable}
              onChange={() => {
                setFormIsDirty(true);
              }}
              autoFocus
            />
          </Form.Item>
          <Form.Item name="actif" label="Actif" valuePropName="checked">
            <Switch
              onChange={() => {
                setFormIsDirty(true);
              }}
              disabled={!isSavable || typeEvenement?.["@id"] === TYPE_EVENEMENT_RENFORT}
            />
          </Form.Item>
          {!typeEvenement?.forfait && (
            <Form.Item<ITypeEvenement>
              name="visibleParDefaut"
              label="Visible par défaut dans le planning"
              valuePropName="checked"
            >
              <Switch
                onChange={(value) => {
                  setFormIsDirty(true);
                  setTypeEvenement({
                    ...typeEvenement,
                    visibleParDefaut: value,
                    forfait: false,
                  });
                }}
                disabled={!isSavable}
              />
            </Form.Item>
          )}
          {!typeEvenement.visibleParDefaut && (
            <Form.Item
              name="forfait"
              label="Type d'intervention au forfait"
              valuePropName="checked"
            >
              <Switch
                onChange={(value) => {
                  setFormIsDirty(true);
                  setTypeEvenement({
                    ...typeEvenement,
                    forfait: value,
                    visibleParDefaut: false,
                  });
                }}
                disabled={!isSavable || typeEvenement?.["@id"] === TYPE_EVENEMENT_RENFORT}
              />
            </Form.Item>
          )}
          <Form.Item name="couleur" label="Couleur" required rules={[{ required: true }]}>
            <ColorPicker
              disabled={!isSavable}
              onChange={() => {
                setFormIsDirty(true);
              }}
            />
          </Form.Item>
          <div className="mt-4">
            <Typography.Text strong>Tarifications</Typography.Text>
            <Form.List name="tauxHoraires">
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, ...field }) => (
                    <Form.Item className="mb-0" required key={key}>
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Une tarification est nécessaire ou supprimez ce champ.",
                          },
                        ]}
                        noStyle
                      >
                        <TauxHoraireFormItem
                          disabled={formIsDirty}
                          setTypeEvenementSavable={setIsSavable}
                          typeEvenement={typeEvenement}
                          onCancel={() => {
                            remove(field.name);
                          }}
                        />
                      </Form.Item>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    {typeEvenement?.["@id"] ? (
                      <Tooltip
                        title={
                          formIsDirty
                            ? "Enregistrez la modification pour pouvoir éditer les catégories"
                            : undefined
                        }
                      >
                        <Button
                          type="link"
                          onClick={() => {
                            setIsSavable(false);
                            add();
                          }}
                          icon={<PlusOutlined />}
                          className="p-0 mt-0 fs-09"
                          disabled={!isSavable || formIsDirty}
                        >
                          Ajouter une tarification
                        </Button>
                      </Tooltip>
                    ) : (
                      <span className="legende">
                        Enregistrez cette nouvelle catégorie pour pouvoir lui affecter une
                        tarification
                      </span>
                    )}

                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Card>
    </Drawer>
  );
}
