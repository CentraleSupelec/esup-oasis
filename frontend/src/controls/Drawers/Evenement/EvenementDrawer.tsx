/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Avatar, Button, Drawer, Form, Space, Tabs } from "antd";
import { useDrawers } from "@context/drawers/DrawersContext";
import { SaveOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/auth/AuthProvider";

interface IEvenementDrawer {
  id?: string;
}

/**
 * Renders a drawer component for displaying event details and allowing event editing.
 *
 * @param {} props - The props object.
 * @param {string} [props.id] - The ID of the event drawer.
 *
 * @returns {ReactElement} The rendered drawer component.
 */
export default function EvenementDrawer({ id }: IEvenementDrawer): ReactElement {
  const auth = useAuth();
  const { drawers, setDrawerEvenement } = useDrawers();
  const evenementId = id || drawers.EVENEMENT;
  const [form] = Form.useForm();

  const handleClose = () => {
    setDrawerEvenement(undefined);
  };

  if (evenementId === undefined) return <Form form={form} className="d-none" />;

  return (
    <Drawer
      destroyOnHidden
      title={"Évènement".toLocaleUpperCase()}
      placement="right"
      onClose={handleClose}
      open
      size="large"
      className="oasis-drawer"
    >
      <Space orientation="vertical" className="text-center w-100 mb-3 mt-1">
        <Avatar size={100} icon={<UserOutlined />} className="bg-evenement shadow-1" />
        <span className="fs-15 semi-bold">Jacques MARTIN</span>
      </Space>
      <Form
        layout="vertical"
        onFinish={() => {
          handleClose();
        }}
        disabled={!auth.user?.isGestionnaire}
        form={form}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "informations",
              label: `Informations`,
              children: <p>Informations</p>,
            },
          ]}
        />
        <Form.Item className="mt-2 text-center">
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
            Enregistrer
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
