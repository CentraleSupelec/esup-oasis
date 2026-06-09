/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import "@routes/administration/Administration.scss";
import { IInterventionForfait, QK_INTERVENTIONS_FORFAIT } from "@api";
import { Button, Card, Drawer, Dropdown, Form, Popconfirm, Space } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { DeleteOutlined, DownOutlined, SaveOutlined } from "@ant-design/icons";
import { UseStateDispatch } from "@utils/utils";
import { InterventionsForfaitForm } from "@controls/Interventions/InterventionsForfaitForm";

interface IInterventionsForfaitEditProps {
  editedItem: Partial<IInterventionForfait>;
  setEditedItem: UseStateDispatch<Partial<IInterventionForfait | undefined>>;
}

/**
 * Edit or add an intervention forfait
 */
export default function InterventionsForfaitEdit({
  editedItem,
  setEditedItem,
}: IInterventionsForfaitEditProps): ReactElement {
  const [form] = Form.useForm();
  const [beneficiairesModifies, setBeneficiairesModifies] = useState(false);

  const { data: periodes } = useApi().useGetFullCollection({
    path: "/periodes",
  });

  // --- Mutations
  const createInterventionForfait = useApi().usePost({
    path: "/interventions_forfait",
    invalidationQueryKeys: [QK_INTERVENTIONS_FORFAIT],
    onSuccess: () => setEditedItem(undefined),
  });

  const updateInterventionForfait = useApi().usePatch({
    path: "/interventions_forfait/{id}",
    invalidationQueryKeys: [QK_INTERVENTIONS_FORFAIT],
    onSuccess: () => setEditedItem(undefined),
  });

  const deleteInterventionForfait = useApi().useDelete({
    path: "/interventions_forfait/{id}",
    invalidationQueryKeys: [QK_INTERVENTIONS_FORFAIT],
    onSuccess: () => setEditedItem(undefined),
  });

  const isEditable =
    !editedItem.periode || !periodes?.items?.find((p) => p["@id"] === editedItem.periode)?.envoyee;

  const save = (values: IInterventionForfait) => {
    const data = { ...values, heures: values.heures.toString() };
    if (editedItem["@id"]) {
      updateInterventionForfait.mutate({ data, "@id": editedItem["@id"] });
    } else {
      createInterventionForfait.mutate({ data });
    }
  };

  // Sync form with editedItem
  useEffect(() => {
    form.setFieldsValue(editedItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedItem]);

  return (
    <Drawer
      className="bg-light-grey"
      open
      title={
        !isEditable
          ? "Consulter une intervention au forfait"
          : editedItem["@id"]
            ? "Modifier une intervention au forfait"
            : "Ajouter une intervention au forfait"
      }
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <Card
        title="Intervention au forfait"
        actions={
          [
            isEditable && <Button onClick={() => setEditedItem(undefined)}>Annuler</Button>,
            (isEditable || beneficiairesModifies) && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={createInterventionForfait.isPending || updateInterventionForfait.isPending}
              >
                Enregistrer
              </Button>
            ),
            !isEditable && <Button onClick={() => setEditedItem(undefined)}>Fermer</Button>,
          ].filter(Boolean) as React.ReactNode[]
        }
        extra={
          editedItem["@id"] && isEditable ? (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "supprimer",
                    label: (
                      <Popconfirm
                        title="Supprimer cette intervention ?"
                        okButtonProps={{ danger: true }}
                        okText="Oui, supprimer"
                        cancelText="Non"
                        onConfirm={() =>
                          deleteInterventionForfait.mutate({
                            "@id": editedItem["@id"] as string,
                          })
                        }
                      >
                        Supprimer
                      </Popconfirm>
                    ),
                    icon: <DeleteOutlined />,
                    danger: true,
                  },
                ],
              }}
            >
              <Space>
                <Button className="no-hover" type="text" icon={<DownOutlined />}>
                  Options
                </Button>
              </Space>
            </Dropdown>
          ) : undefined
        }
      >
        <InterventionsForfaitForm
          form={form}
          editedItem={editedItem}
          setEditedItem={setEditedItem}
          onFinish={save}
          isEditable={isEditable}
          setBeneficiairesModifies={setBeneficiairesModifies}
        />
      </Card>
    </Drawer>
  );
}
