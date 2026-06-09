/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { App, Button, Checkbox, Divider, Form, List, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { QK_COMMISSIONS_MEMBRES, QK_ROLES_UTILISATEURS } from "@api";
import { RoleValues } from "@lib";
import UtilisateurFormItemSelect from "@controls/Forms/UtilisateurFormItemSelect";

interface CommissionsMemberAddFormProps {
  commissionId: string | undefined;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const CommissionsMemberAddForm: React.FC<CommissionsMemberAddFormProps> = ({
  commissionId,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();

  const mutationPut = useApi().usePut({
    path: "/commissions/{commissionId}/membres/{uid}",
    invalidationQueryKeys: [QK_COMMISSIONS_MEMBRES, QK_ROLES_UTILISATEURS],
    onSuccess: () => {
      message.success("Le membre a bien été ajouté").then();
      if (onSuccess) onSuccess();
    },
  });

  return (
    <List className="ant-list-radius mb-3">
      <List.Item>
        <Form
          layout="vertical"
          className="w-100"
          onFinish={(values) => {
            mutationPut.mutate({
              "@id": `${commissionId}/membres/${(values.uid as string).replace(
                "/utilisateurs/",
                "",
              )}`,
              data: {
                roles: [
                  values.confirmerValidite ? RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE : undefined,
                  values.attribuerProfil ? RoleValues.ROLE_ATTRIBUER_PROFIL : undefined,
                ].filter((r) => r !== undefined) as RoleValues[],
              },
            });
          }}
        >
          <Form.Item
            label="Membre"
            name="uid"
            required
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner un membre",
              },
            ]}
          >
            <UtilisateurFormItemSelect
              style={{ width: "100%" }}
              placeholder="Rechercher un membre"
              className="mt-1"
            />
          </Form.Item>
          <Divider>Privilèges</Divider>
          <Form.Item name="confirmerValidite" valuePropName="checked">
            <Checkbox>Valider la conformité de la demande</Checkbox>
          </Form.Item>
          <Form.Item name="attribuerProfil" valuePropName="checked">
            <Checkbox>Attribuer le profil aux bénéficiaires</Checkbox>
          </Form.Item>
          <Form.Item className="mt-2">
            <Space>
              <Button type="primary" icon={<PlusOutlined />} htmlType="submit">
                Ajouter
              </Button>
              <Button onClick={onCancel}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </List.Item>
    </List>
  );
};
