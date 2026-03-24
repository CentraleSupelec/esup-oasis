/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import "../../routes/administration/Administration.scss";
import {
   Alert,
   Button,
   Card,
   Col,
   Drawer,
   Dropdown,
   Form,
   InputNumber,
   MenuProps,
   Popconfirm,
   Row,
   Select,
   Space,
} from "antd";
import { NB_MAX_ITEMS_PER_PAGE } from "../../constants";
import { useApi } from "../../context/api/ApiProvider";
import TypeEvenementItem from "../Items/TypeEvenementItem";
import PeriodeRhItem from "../Items/PeriodeRhItem";
import UtilisateurFormItemSelect from "../Forms/UtilisateurFormItemSelect";
import { RoleValues } from "../../lib/Utilisateur";
import { DeleteOutlined, DownOutlined, ExclamationOutlined, SaveOutlined } from "@ant-design/icons";
import { useAuth } from "../../auth/AuthProvider";
import dayjs from "dayjs";
import GestionnaireItem from "../Items/GestionnaireItem";
import { TabEvenementParticipantsBeneficiaires } from "../TabsContent/SubTabs/TabEvenementParticipantsBeneficiaires";
import { IInterventionForfait } from "../../api/ApiTypeHelpers";

import { UseStateDispatch } from "../../utils/utils";

interface IInterventionsForfaitEditProps {
   editedItem: Partial<IInterventionForfait>;
   setEditedItem: UseStateDispatch<Partial<IInterventionForfait | undefined>>;
}

/**
 * Edit or add an intervention forfait
 *
 * @param {Object} props - The component properties
 * @param {Object} props.editedItem - The item being edited
 * @param {Function} props.setEditedItem - The function to set the edited item
 * @returns {ReactElement} - The rendered component
 */
export default function InterventionsForfaitEdit({
   editedItem,
   setEditedItem,
}: IInterventionsForfaitEditProps): ReactElement {
   const user = useAuth().user;
   const [form] = Form.useForm();
   const [beneficiairesModifies, setBeneficiairesModifies] = useState(false);
   const { data: periodes, isFetching: isFetchingPeriodes } = useApi().useGetCollectionPaginated({
      path: "/periodes",
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
   });
   const { data: typesEvenements, isFetching: isFetchingTypesEvenements } =
      useApi().useGetCollectionPaginated({
         path: "/types_evenements",
         page: 1,
         itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
         query: {
            forfait: true,
         },
      });

   // --- Mutations
   const createInterventionForfait = useApi().usePost({
      path: "/interventions_forfait",
      invalidationQueryKeys: ["/interventions_forfait"],
      onSuccess: () => {
         setEditedItem(undefined);
      },
   });

   const updateInterventionForfait = useApi().usePatch({
      path: "/interventions_forfait/{id}",
      invalidationQueryKeys: ["/interventions_forfait"],
      onSuccess: () => {
         setEditedItem(undefined);
      },
   });

   const deleteInterventionForfait = useApi().useDelete({
      path: "/interventions_forfait/{id}",
      invalidationQueryKeys: ["/interventions_forfait"],
      onSuccess: () => {
         setEditedItem(undefined);
      },
   });

   const itemsMenu: MenuProps["items"] = [
      {
         key: "supprimer",
         label: (
            <Popconfirm
               title="Supprimer cette intervention ?"
               okButtonProps={{ danger: true }}
               okText="Oui, supprimer"
               cancelText="Non"
               onConfirm={() => {
                  deleteInterventionForfait.mutate({
                     "@id": editedItem["@id"] as string,
                  });
               }}
            >
               Supprimer
            </Popconfirm>
         ),
         icon: <DeleteOutlined />,
         danger: true,
      },
   ];

   const save = (values: IInterventionForfait) => {
      if (editedItem["@id"]) {
         updateInterventionForfait.mutate({ data: values, "@id": editedItem["@id"] });
      } else {
         createInterventionForfait.mutate({ data: values });
      }
   };

   function editable() {
      return (
         !editedItem.periode ||
         !periodes?.items?.find((p) => p["@id"] === editedItem.periode)?.envoyee
      );
   }

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
            !editable()
               ? "Consulter une intervention au forfait"
               : editedItem["@id"]
                 ? "Modifier une intervention au forfait"
                 : "Ajouter une intervention au forfait"
         }
         onClose={() => {
            setEditedItem(undefined);
         }}
         size="large"
      >
         <Form<IInterventionForfait>
            layout="vertical"
            form={form}
            onFinish={(values) => {
               save({ ...(values as IInterventionForfait), heures: values.heures.toString() });
            }}
            initialValues={{
               type: typesEvenements?.items[0]["@id"],
            }}
         >
            <Card
               title="Intervention au forfait"
               actions={[
                  editable() && <Button onClick={() => setEditedItem(undefined)}>Annuler</Button>,
                  (editable() || beneficiairesModifies) && (
                     <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                        Enregistrer
                     </Button>
                  ),
                  !editable() && (
                     <Button disabled={false} onClick={() => setEditedItem(undefined)}>
                        Fermer
                     </Button>
                  ),
               ].filter((a) => a !== false)}
               extra={
                  editedItem["@id"] && editable() ? (
                     <Dropdown menu={{ items: itemsMenu }}>
                        <Space>
                           <Button className="no-hover" type="text" icon={<DownOutlined />}>
                              Options
                           </Button>
                        </Space>
                     </Dropdown>
                  ) : undefined
               }
            >
               <Form.Item
                  label="Période"
                  name="periode"
                  required
                  rules={[{ required: true, message: "Veuillez sélectionner une période" }]}
               >
                  <Select
                     value={editedItem.periode}
                     onChange={(value) => {
                        setEditedItem({ ...editedItem, periode: value });
                     }}
                     className="w-100"
                     loading={isFetchingPeriodes}
                     allowClear
                     disabled={!editable()}
                  >
                     {periodes?.items
                        .filter((p) => !p.envoyee || !editable())
                        .filter((p) => user?.isAdmin || dayjs(p.butoir).isAfter(dayjs()))
                        .map((periode) => (
                           <Select.Option key={periode["@id"]} value={periode["@id"]}>
                              <PeriodeRhItem periode={periode} />
                           </Select.Option>
                        ))}
                  </Select>
               </Form.Item>
               <Form.Item
                  label="Intervenant"
                  name="intervenant"
                  rules={[{ required: true, message: "Veuillez sélectionner un intervenant" }]}
                  required
               >
                  <UtilisateurFormItemSelect
                     className="w-100"
                     onSelect={(value) => {
                        setEditedItem({ ...editedItem, intervenant: value });
                     }}
                     placeholder="Rechercher un intervenant"
                     roleUtilisateur={RoleValues.ROLE_INTERVENANT}
                     disabled={!editable()}
                  />
               </Form.Item>
               <Form.Item
                  label="Catégorie d'événement"
                  required
                  name="type"
                  rules={[
                     {
                        required: true,
                        message: "Veuillez sélectionner une catégorie d'événement",
                     },
                  ]}
               >
                  <Select
                     value={editedItem.type}
                     onChange={(value) => {
                        setEditedItem({ ...editedItem, type: value });
                     }}
                     className="w-100"
                     loading={isFetchingTypesEvenements}
                     allowClear
                     disabled={!editable()}
                  >
                     {typesEvenements?.items.map((typeEvenement) => (
                        <Select.Option key={typeEvenement["@id"]} value={typeEvenement["@id"]}>
                           <TypeEvenementItem typeEvenement={typeEvenement} showAvatar={false} />
                        </Select.Option>
                     ))}
                  </Select>
               </Form.Item>
               <Form.Item
                  label="Durée"
                  rules={[{ required: true, message: "Veuillez saisir une durée" }]}
                  required
                  name="heures"
               >
                  <InputNumber
                     value={editedItem.heures}
                     onChange={(value) => {
                        setEditedItem({ ...editedItem, heures: value || "0" });
                     }}
                     className="w-100"
                     placeholder="Durée en heures"
                     min="0.00"
                     step={0.5}
                     precision={1}
                     decimalSeparator=","
                     disabled={!editable()}
                  />
               </Form.Item>
               <TabEvenementParticipantsBeneficiaires
                  evenement={editedItem}
                  setEvenement={(v) => {
                     setEditedItem({ ...editedItem, ...(v as IInterventionForfait) });
                     setBeneficiairesModifies(true);
                  }}
               />
               {(editedItem.beneficiaires || []).length === 0 && (
                  <Alert
                     type="warning"
                     showIcon
                     icon={<ExclamationOutlined />}
                     title="Aucun bénéficiaire associé"
                     description="Vous devez associer les bénéficiaires de cette intervention."
                  />
               )}
               <Row className="mb-3">
                  <Col span={24} className="legende mt-1">
                     Créé le {dayjs(editedItem.dateCreation).format("DD/MM/YYYY")}
                     {editedItem.utilisateurCreation && (
                        <>
                           {" "}
                           par{" "}
                           <GestionnaireItem
                              gestionnaireId={editedItem.utilisateurCreation}
                              showAvatar={false}
                           />
                        </>
                     )}
                     {editedItem.dateModification && (
                        <>
                           <br />
                           Dernière modification le{" "}
                           {dayjs(editedItem.dateModification).format("DD/MM/YYYY")}
                           {editedItem.utilisateurModification && (
                              <>
                                 {" "}
                                 par{" "}
                                 <GestionnaireItem
                                    gestionnaireId={editedItem.utilisateurModification}
                                    showAvatar={false}
                                 />
                              </>
                           )}
                        </>
                     )}
                  </Col>
               </Row>
            </Card>
         </Form>
      </Drawer>
   );
}
