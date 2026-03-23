/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { Avatar, Button, Drawer, Empty, Form, Input, List, Space } from "antd";
import { SaveOutlined, SearchOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { useApi } from "../../../context/api/ApiProvider";
import ListSelectable from "../../Forms/ListSelectable/ListSelectable";
import { getRoleLabel, RoleValues } from "../../../lib/Utilisateur";
import { IUtilisateur } from "../../../api/ApiTypeHelpers";

interface IUtilisateurCreerDrawer {
   type: RoleValues;
   open: boolean;
   setOpen: (open: boolean) => void;
   onChange: (data: IUtilisateur) => void;
}

/**
 * Function to create a drawer for creating a user.
 *
 * @param {Object} IUtilisateurCreerDrawer - The data required for creating the drawer.
 * @param {string} IUtilisateurCreerDrawer.type - The type of user (ROLE_INTERVENANT/ROLE_BENEFICIAIRE).
 * @param {boolean} IUtilisateurCreerDrawer.open - Flag to determine if the drawer is open or closed.
 * @param {function} IUtilisateurCreerDrawer.setOpen - Function to set the open state of the drawer.
 * @param {function} IUtilisateurCreerDrawer.onChange - Function to handle the onChange event.
 *
 * @return {ReactElement} The JSX element representing the user create drawer.
 */
export default function UtilisateurCreerDrawer({
   type,
   open,
   setOpen,
   onChange,
}: IUtilisateurCreerDrawer): ReactElement {
   const [recherche, setRecherche] = useState("");
   const [selectedUtilisateur, setSelectedUtilisateur] = useState<IUtilisateur>();
   const { data: utilisateursProposes, isFetching } = useApi().useGetCollectionPaginated({
      path: "/utilisateurs",
      page: 1,
      itemsPerPage: 50,
      enabled: recherche.length > 2,
      query: {
         term: recherche,
      },
   });
   const handleClose = () => {
      setRecherche("");
      setOpen(false);
   };

   const handleAjouter = () => {
      setRecherche("");
      setSelectedUtilisateur(undefined);
      if (selectedUtilisateur) onChange(selectedUtilisateur);
   };

   return (
      <Drawer
         destroyOnHidden
         title={getRoleLabel(type).toLocaleUpperCase()}
         placement="right"
         onClose={handleClose}
         open={open}
         className="oasis-drawer"
      >
         <Space orientation="vertical" className="text-center w-100 mb-3 mt-1">
            <Avatar
               size={100}
               icon={<UserAddOutlined />}
               className={`${
                  type === RoleValues.ROLE_INTERVENANT ? "bg-intervenant" : "bg-beneficiaire"
               } shadow-1`}
            />
         </Space>

         {!utilisateursProposes && (
            <Form
               layout="vertical"
               onFinish={(values) => {
                  setRecherche(values.term);
               }}
            >
               <Form.Item
                  name="term"
                  required
                  rules={[
                     { required: true, message: "Le champ de recherche est obligatoire" },
                     {
                        min: 3,
                        message: "Le champ de recherche doit contenir au moins 3 caractères",
                     },
                  ]}
               >
                  <Input.Search placeholder="Rechercher par nom, prénom" />
               </Form.Item>

               <Form.Item className="mt-2 text-center">
                  <Button
                     type="primary"
                     icon={<SearchOutlined />}
                     htmlType="submit"
                     size="large"
                     loading={isFetching}
                  >
                     Rechercher
                  </Button>
               </Form.Item>
            </Form>
         )}

         {utilisateursProposes && utilisateursProposes.items.length > 0 && (
            <div className="mt-3">
               <h3>Utilisateurs proposés</h3>
               <ListSelectable
                  items={utilisateursProposes.items}
                  selectedItemId={selectedUtilisateur?.["@id"]}
                  classNameSelected="bg-intervenant-light"
                  onSelect={(item) => {
                     setSelectedUtilisateur(item);
                  }}
                  renderItem={(item) => (
                     <List.Item.Meta
                        className="meta"
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={`${item.prenom} ${item.nom?.toLocaleUpperCase()}`}
                        description={item.email || "Pas d'email"}
                     />
                  )}
               />

               <Space className="text-center mt-3">
                  <Button
                     size="large"
                     onClick={() => {
                        setRecherche("");
                        setSelectedUtilisateur(undefined);
                     }}
                  >
                     Annuler
                  </Button>
                  <Button
                     type="primary"
                     icon={<SaveOutlined />}
                     size="large"
                     onClick={handleAjouter}
                     disabled={!selectedUtilisateur}
                  >
                     Sélectionner
                  </Button>
               </Space>
            </div>
         )}

         {utilisateursProposes && utilisateursProposes.items.length === 0 && (
            <div className="text-center">
               <Empty />
               <Button className="mt-2" onClick={() => setRecherche("")}>
                  Nouvelle recherche
               </Button>
            </div>
         )}
      </Drawer>
   );
}
