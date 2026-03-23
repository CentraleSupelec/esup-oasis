/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
   App,
   Button,
   Card,
   Checkbox,
   Divider,
   Drawer,
   Empty,
   Form,
   Input,
   List,
   Popconfirm,
   Skeleton,
   Space,
   Switch,
   Tag,
   Typography,
} from "antd";
import React, { ReactElement, useEffect, useState } from "react";
import { ICommission, ICommissionMembre, IUtilisateur } from "../../../api/ApiTypeHelpers";
import { useApi } from "../../../context/api/ApiProvider";
import { NB_MAX_ITEMS_PER_PAGE } from "../../../constants";
import { UtilisateurAvatar } from "../../Avatars/UtilisateurAvatar";
import { RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import UtilisateurFormItemSelect from "../../Forms/UtilisateurFormItemSelect";

interface CommissionsEditionProps {
   editedItem?: ICommission;
   setEditedItem: (item: ICommission | undefined) => void;
}

function CommissionsEditionMembreRole(props: { membre: ICommissionMembre }) {
   const { message } = App.useApp();
   const [editing, setEditing] = useState<boolean>(false);
   const [attribuerProfil, setAttribuerProfil] = useState<boolean>(
      props.membre.roles?.includes(RoleValues.ROLE_ATTRIBUER_PROFIL) as boolean,
   );
   const [validerConformite, setValiderConformite] = useState<boolean>(
      props.membre.roles?.includes(RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE) as boolean,
   );

   const mutationPut = useApi().usePut({
      path: "/commissions/{commissionId}/membres/{uid}",
      invalidationQueryKeys: [
         "/commissions/{commissionId}/membres",
         "/roles/{roleId}/utilisateurs",
      ],
      onSuccess: () => {
         message.success("Le membre a bien été modifié").then();
         setEditing(false);
      },
   });

   if (editing) {
      return (
         <Space orientation="vertical">
            <div className="mt-1">
               <Checkbox
                  className="mr-1"
                  checked={validerConformite}
                  onChange={(e) => setValiderConformite(e.target.checked)}
               >
                  Valider la conformité des demandes
               </Checkbox>
            </div>
            <>
               <Checkbox
                  className="mr-1"
                  checked={attribuerProfil}
                  onChange={(e) => setAttribuerProfil(e.target.checked)}
               >
                  Attribuer le profil aux bénéficiaires
               </Checkbox>
            </>
            <div className="mt-2">
               <Button
                  type="primary"
                  onClick={() => {
                     mutationPut.mutate({
                        "@id": props.membre["@id"] as string,
                        data: {
                           roles: [
                              validerConformite
                                 ? RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE
                                 : undefined,
                              attribuerProfil ? RoleValues.ROLE_ATTRIBUER_PROFIL : undefined,
                           ].filter((r) => r !== undefined) as RoleValues[],
                        },
                     });
                  }}
               >
                  Enregistrer
               </Button>
               <Button
                  className="ml-1"
                  onClick={() => {
                     setEditing(false);
                  }}
               >
                  Annuler
               </Button>
            </div>
         </Space>
      );
   }

   // noinspection JSUnusedGlobalSymbols
   return (
      <Typography.Text
         type="secondary"
         editable={{
            tooltip: "Cliquez pour modifier les privilèges",
            onStart: () => {
               setEditing(true);
            },
         }}
      >
         {props.membre.roles?.includes(RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE) && (
            <Tag color="purple">Valider conformité</Tag>
         )}
         {props.membre.roles?.includes(RoleValues.ROLE_ATTRIBUER_PROFIL) && (
            <Tag color="purple">Attribuer profil</Tag>
         )}
         {!props.membre.roles?.includes(RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE) &&
            !props.membre.roles?.includes(RoleValues.ROLE_ATTRIBUER_PROFIL) &&
            "Aucun privilège"}
      </Typography.Text>
   );
}

function CommissionsEditionMembre(props: { membre: ICommissionMembre }) {
   const { message } = App.useApp();
   const [membreUtilisateur, setMembreUtilisateur] = useState<Utilisateur>();
   const { data: membre, isFetching } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: props.membre.utilisateur,
      enabled: !!props.membre.utilisateur,
   });

   const mutationDelete = useApi().useDelete({
      path: "/commissions/{commissionId}/membres/{uid}",
      invalidationQueryKeys: ["/commissions/{commissionId}/membres"],
      onSuccess: () => {
         message.success("Le membre a bien été retiré de la commission").then();
      },
   });

   useEffect(() => {
      if (membre) setMembreUtilisateur(new Utilisateur(membre as IUtilisateur));
   }, [membre]);

   if (isFetching) return <Skeleton paragraph={{ rows: 1 }} active />;
   if (!membre) return null;

   return (
      <List.Item
         actions={[
            <Popconfirm
               title="Voulez-vous vraiment retirer ce membre de la commission ?"
               onConfirm={() => {
                  mutationDelete.mutate({
                     "@id": props.membre["@id"] as string,
                  });
               }}
               okText="Oui"
               okType="danger"
               cancelText="Non"
            >
               <Button
                  icon={<DeleteOutlined aria-hidden />}
                  className="btn-danger-hover btn-label-hover"
               >
                  Supprimer
               </Button>
            </Popconfirm>,
         ]}
      >
         <List.Item.Meta
            title={`${membre?.nom} ${membre?.prenom}`}
            description={<CommissionsEditionMembreRole membre={props.membre} />}
            avatar={
               <UtilisateurAvatar
                  utilisateur={membre}
                  role={membreUtilisateur?.roleCalcule as RoleValues}
               />
            }
         />
      </List.Item>
   );
}

function CommissionsMembreAjouter(props: {
   commissionId: string | undefined;
   setAjouterMembre: React.Dispatch<React.SetStateAction<boolean>>;
}) {
   const { message } = App.useApp();

   const mutationPut = useApi().usePut({
      path: "/commissions/{commissionId}/membres/{uid}",
      invalidationQueryKeys: [
         "/commissions/{commissionId}/membres",
         "/roles/{roleId}/utilisateurs",
      ],
      onSuccess: () => {
         message.success("Le membre a bien été ajouté").then();
         props.setAjouterMembre(false);
      },
   });

   return (
      <List className="ant-list-radius mb-3">
         <List.Item>
            <Form
               layout="vertical"
               className="w-100"
               onFinish={(values) => {
                  // noinspection JSUnresolvedReference
                  mutationPut.mutate({
                     "@id": `${props.commissionId}/membres/${(values.uid as string).replace(
                        "/utilisateurs/",
                        "",
                     )}`,
                     data: {
                        roles: [
                           values.confirmerValidite
                              ? RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE
                              : undefined,
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
                  <>
                     <Button type="primary" icon={<PlusOutlined />} htmlType="submit">
                        Ajouter
                     </Button>
                     <Button
                        className="ml-2"
                        onClick={() => {
                           props.setAjouterMembre(false);
                        }}
                     >
                        Annuler
                     </Button>
                  </>
               </Form.Item>
            </Form>
         </List.Item>
      </List>
   );
}

export function CommissionsEditionMembres(props: { commissionId: string | undefined }) {
   const [ajouterMembre, setAjouterMembre] = useState<boolean>(false);
   const { data: membres, isFetching } = useApi().useGetCollection({
      path: "/commissions/{commissionId}/membres",
      query: {
         page: 1,
         itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      },
      parameters: {
         commissionId: props.commissionId as string,
      },
      enabled: !!props.commissionId,
   });

   if (isFetching) return <Skeleton paragraph={{ rows: 4 }} active />;

   if (!membres) return null;

   return (
      <>
         {ajouterMembre && (
            <CommissionsMembreAjouter
               commissionId={props.commissionId}
               setAjouterMembre={setAjouterMembre}
            />
         )}
         <List
            className="ant-list-radius"
            header={
               props.commissionId && (
                  <div className="text-right">
                     <Button
                        key="ajouterMembre"
                        type="primary"
                        icon={<PlusOutlined aria-hidden />}
                        onClick={() => {
                           setAjouterMembre(true);
                        }}
                     >
                        Ajouter un membre
                     </Button>
                  </div>
               )
            }
         >
            {membres.items.map((membre) => (
               <CommissionsEditionMembre key={membre["@id"]} membre={membre} />
            ))}
            {membres.items.length === 0 && (
               <List.Item>
                  <Empty className="m-auto" description="Aucun membre dans cette commission" />
               </List.Item>
            )}
         </List>
      </>
   );
}

/**
 * Handles the creation or update of a profile.
 *
 * @param {CommissionsEditionProps} props - The component props.
 * @param {IProfil} [props.editedItem] - The item being edited.
 * @param {function} props.setEditedItem - The function to set the edited item.
 * @returns {ReactElement} - The rendered component.
 */
export function CommissionsEdition({
   editedItem,
   setEditedItem,
}: CommissionsEditionProps): ReactElement {
   const [form] = Form.useForm();

   const mutationPost = useApi().usePost({
      path: "/commissions",
      invalidationQueryKeys: ["/commissions"],
      onSuccess: () => {
         setEditedItem(undefined);
      },
   });

   const mutationPatch = useApi().usePatch({
      path: `/commissions/{id}`,
      invalidationQueryKeys: ["/commissions"],
      onSuccess: () => {
         setEditedItem(undefined);
      },
   });

   function createOrUpdate(values: ICommission) {
      if (!editedItem) return;
      if (editedItem["@id"] === undefined) {
         // Création
         mutationPost?.mutate({
            data: values,
         });
      } else {
         // Modification
         mutationPatch?.mutate({
            "@id": editedItem["@id"],
            data: values,
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
         title={editedItem?.["@id"] ? "Éditer une commission" : "Ajouter une commission"}
         onClose={() => setEditedItem(undefined)}
         size="large"
      >
         <Card
            title="Commission"
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
            </Form>
         </Card>
      </Drawer>
   );
}
