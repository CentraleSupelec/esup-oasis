/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { Avatar, Button, Collapse, Drawer, Empty, Form, List, Space, Tag, Typography } from "antd";
import { InfoCircleOutlined, SaveOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { TabTypeEvenement } from "../../TabsContent/TabTypeEvenement";
import { TabCompetence } from "../../TabsContent/TabCompetence";
import ListSelectable from "../../Forms/ListSelectable/ListSelectable";
import { useApi } from "../../../context/api/ApiProvider";
import { NB_MAX_ITEMS_PER_PAGE } from "../../../constants";
import UtilisateurDrawer from "../Utilisateur/UtilisateurDrawer";
import { TabCampus } from "../../TabsContent/TabCampus";
import CampusItem from "../../Items/CampusItem";
import TypeEvenementItem from "../../Items/TypeEvenementItem";
import CompetenceItem from "../../Items/CompetenceItem";

export interface IFiltreRechercheIntervenant {
   nom?: string;
   "intervenant.campuses"?: string;
   "intervenant.typesEvenements"?: string;
   "intervenant.competences"?: string;
   beneficiaire?: string;
   "creneau[debut]"?: string;
   "creneau[fin]"?: string;
}

interface IIntervenantDrawer {
   open: boolean;
   setOpen: (open: boolean) => void;
   onChange: (id: string) => void;
   defaultSearchOptions?: IFiltreRechercheIntervenant;
   afficherFiltres: boolean;
   btnLabel?: string;
}

/**
 * Drawer component for searching and selecting an Intervenant
 *
 * @param {object} props - The properties object
 * @param {function} props.onChange - Callback function when an Intervenant is selected
 * @param {boolean} props.open - Flag to control the visibility of the Drawer
 * @param {function} props.setOpen - Callback function to control the visibility of the Drawer
 * @param {object} [props.defaultSearchOptions] - Default search options for the Intervenant search
 * @param {boolean} props.afficherFiltres - Flag to display filter options in the Drawer
 * @param {string} [props.btnLabel] - Label for the "Affecter" button in the Drawer
 *
 * @returns {ReactElement} The IntervenantRechercherDrawer component
 */
export default function IntervenantRechercherDrawer({
   onChange,
   open,
   setOpen,
   defaultSearchOptions,
   afficherFiltres,
   btnLabel = "Affecter",
}: IIntervenantDrawer) {
   const [form] = Form.useForm();
   const [filtreRecherche, setFiltreRecherche] = useState<IFiltreRechercheIntervenant>(
      defaultSearchOptions || {},
   );
   const [selectedIntervenant, setSelectedIntervenant] = useState<string>();
   const [selectedIntervenantDetails, setSelectedIntervenantDetails] = useState<string>();
   const [submitted, setSubmitted] = useState(false);
   const { data: intervenantsProposes, isFetching } = useApi().useGetCollectionPaginated({
      path: "/intervenants",
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      enabled: submitted,
      query: filtreRecherche,
   });

   useEffect(() => {
      if (defaultSearchOptions && !submitted) {
         setFiltreRecherche(defaultSearchOptions);
         // setSubmitted(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [defaultSearchOptions]);

   useEffect(() => {
      form.resetFields();
      form.setFieldsValue(filtreRecherche);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filtreRecherche]);

   const handleClose = () => {
      setSubmitted(false);
      setFiltreRecherche({});
      setOpen(false);
      setSelectedIntervenant(undefined);
      form.resetFields();
   };

   const handleAffecter = () => {
      if (selectedIntervenant) onChange(selectedIntervenant);
      handleClose();
   };

   return (
      <Drawer
         destroyOnHidden
         title={"Intervenant".toLocaleUpperCase()}
         placement="right"
         onClose={handleClose}
         open={open}
         size="large"
         className="oasis-drawer"
      >
         <Space orientation="vertical" className="text-center w-100 mb-3 mt-1">
            <Avatar size={100} icon={<SearchOutlined />} className="bg-intervenant shadow-1" />
         </Space>
         {!intervenantsProposes && (
            <Form
               form={form}
               layout="vertical"
               onFinish={() => {
                  setSubmitted(true);
               }}
               initialValues={filtreRecherche}
               onValuesChange={(changedValues) => {
                  setFiltreRecherche((prev) => ({ ...prev, ...changedValues }));
               }}
            >
               {afficherFiltres && (
                  <>
                     <Typography.Title level={4} className="mb-2">
                        Rechercher un intervenant selon les critères de l'évènement
                     </Typography.Title>
                     <Collapse defaultActiveKey="competences">
                        <Collapse.Panel
                           key="campus"
                           header="Campus de l'évènement"
                           extra={
                              filtreRecherche["intervenant.campuses"] ? (
                                 <Tag
                                    color="processing"
                                    closable
                                    onClose={() => {
                                       setFiltreRecherche((prev) => ({
                                          ...prev,
                                          "intervenant.campuses": undefined,
                                       }));
                                    }}
                                 >
                                    <CampusItem
                                       showAvatar={false}
                                       campusId={filtreRecherche["intervenant.campuses"]}
                                    />
                                 </Tag>
                              ) : null
                           }
                        >
                           <TabCampus />
                        </Collapse.Panel>
                        <Collapse.Panel
                           key="typeEvenement"
                           header="Catégorie de l'évènement"
                           extra={
                              filtreRecherche["intervenant.typesEvenements"] ? (
                                 <Tag
                                    className="tag-ellipsis"
                                    closable
                                    onClose={() => {
                                       setFiltreRecherche((prev) => ({
                                          ...prev,
                                          "intervenant.typesEvenements": undefined,
                                       }));
                                    }}
                                 >
                                    <TypeEvenementItem
                                       showAvatar={false}
                                       typeEvenementId={
                                          filtreRecherche["intervenant.typesEvenements"]
                                       }
                                       styleLibelle={{
                                          maxWidth: 150,
                                          textOverflow: "ellipsis",
                                          overflowX: "hidden",
                                       }}
                                    />
                                 </Tag>
                              ) : null
                           }
                        >
                           <TabTypeEvenement />
                        </Collapse.Panel>
                        <Collapse.Panel
                           header="Compétences requises pour l'évènement"
                           key="competences"
                           extra={
                              filtreRecherche["intervenant.competences"] ? (
                                 <Tag
                                    className="tag-ellipsis"
                                    closable
                                    onClose={() => {
                                       setFiltreRecherche((prev) => ({
                                          ...prev,
                                          "intervenant.competences": undefined,
                                       }));
                                    }}
                                 >
                                    <CompetenceItem
                                       competenceId={filtreRecherche["intervenant.competences"]}
                                       showAvatar={false}
                                       styleLibelle={{
                                          maxWidth: 150,
                                          textOverflow: "ellipsis",
                                          overflowX: "hidden",
                                       }}
                                    />
                                 </Tag>
                              ) : null
                           }
                        >
                           <TabCompetence />
                        </Collapse.Panel>
                     </Collapse>
                  </>
               )}

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
         {intervenantsProposes && submitted && (
            <div className="mt-3">
               {selectedIntervenantDetails && (
                  <UtilisateurDrawer
                     id={selectedIntervenantDetails}
                     onClose={() => setSelectedIntervenantDetails(undefined)}
                  />
               )}
               <h3>Intervenants proposés</h3>
               {intervenantsProposes.items.length > 0 ? (
                  <>
                     <ListSelectable
                        items={intervenantsProposes.items}
                        selectedItemId={selectedIntervenant}
                        classNameSelected="bg-intervenant-light"
                        onSelect={(item) => {
                           setSelectedIntervenant(item ? item["@id"] : undefined);
                        }}
                        extra={(item) => {
                           return (
                              <Button
                                 onClick={() => setSelectedIntervenantDetails(item["@id"])}
                                 type="text"
                                 icon={<InfoCircleOutlined style={{ fontSize: "1.5rem" }} />}
                              />
                           );
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
                     <div className="text-center mt-3">
                        <Button onClick={() => setSubmitted(false)} size="large" className="mr-2">
                           Retour
                        </Button>
                        <Button
                           type="primary"
                           icon={<SaveOutlined />}
                           size="large"
                           onClick={handleAffecter}
                           disabled={!selectedIntervenant}
                        >
                           {btnLabel}
                        </Button>
                     </div>
                  </>
               ) : (
                  <>
                     <Empty description="Aucun intervenant ne correspond aux critères" />
                     <div className="text-center mt-3">
                        <Button onClick={() => setSubmitted(false)} size="large">
                           Retour
                        </Button>
                     </div>
                  </>
               )}
            </div>
         )}
      </Drawer>
   );
}
