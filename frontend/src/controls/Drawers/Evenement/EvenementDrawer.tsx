/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import { Avatar, Button, Drawer, Form, Space, Tabs } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { IStore } from "../../../redux/Store";
import { IDrawers } from "../../../redux/context/IDrawers";
import { setDrawerEvenement } from "../../../redux/actions/Drawers";
import { SaveOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../auth/AuthProvider";

interface IEvenementDrawer {
   id?: string;
}

/**
 * Renders a drawer component for displaying event details and allowing event editing.
 *
 * @param {Object} props - The props object.
 * @param {string} [props.id] - The ID of the event drawer.
 *
 * @returns {ReactElement} The rendered drawer component.
 */
export default function EvenementDrawer({ id }: IEvenementDrawer): ReactElement {
   const auth = useAuth();
   const [evenementId, setEvenementId] = useState(id);
   const appDrawers: IDrawers = useSelector(({ drawers }: Partial<IStore>) => drawers) as IDrawers;
   const dispatch = useDispatch();
   const [form] = Form.useForm();

   // Pour initialisation via appDrawers.EVENEMENT
   useEffect(() => {
      setEvenementId(appDrawers.EVENEMENT);
   }, [appDrawers.EVENEMENT]);

   const handleClose = () => {
      dispatch(setDrawerEvenement(undefined));
   };

   if (evenementId === undefined) return <Form form={form} className="d-none" />;

   return (
      <Drawer
         destroyOnHidden
         title={"Évènement".toLocaleUpperCase()}
         placement="right"
         onClose={handleClose}
         open
         width="33%"
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
