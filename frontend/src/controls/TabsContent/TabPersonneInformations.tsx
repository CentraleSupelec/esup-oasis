/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Form, Input } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import React, { ReactElement } from "react";

/**
 * Generates a tab containing personal information and contact details.
 *
 * @returns {ReactElement} A React component representing the tab with personal information.
 */
export function TabPersonneInformations(): ReactElement {
  return (
    <>
      <p className="semi-bold">Informations et coordonnées</p>
      <Form.Item name="nom" label="Nom">
        <Input disabled />
      </Form.Item>
      <Form.Item name="prenom" label="Prénom">
        <Input disabled />
      </Form.Item>
      <Form.Item name="email" label="Email institutionnel">
        <Input disabled prefix={<MailOutlined />} inputMode="email" />
      </Form.Item>
      <Form.Item
        label="Email personnel"
        name="emailPerso"
        rules={[
          {
            type: "email",
            message: "Email non valide",
          },
        ]}
      >
        <Input prefix={<MailOutlined />} inputMode="email" />
      </Form.Item>
      <Form.Item label="Téléphone" name="telPerso">
        <Input prefix={<PhoneOutlined />} inputMode="tel" />
      </Form.Item>
    </>
  );
}
