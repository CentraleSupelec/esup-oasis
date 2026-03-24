/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setModalEvenement, setModalEvenementId } from "../../../redux/actions/Modals";
import { App, Button, Col, Form, Modal, Row, Space, Tabs } from "antd";
import TabEvenementInformations from "../../TabsContent/TabEvenementInformations";
import { SaveOutlined } from "@ant-design/icons";
import { TabEquipement } from "../../TabsContent/TabEquipement";
import { TabPaiement } from "../../TabsContent/TabPaiement";
import { Evenement } from "../../../lib/Evenement";
import { useAuth } from "../../../auth/AuthProvider";
import { useApi } from "../../../context/api/ApiProvider";
import Spinner from "../../Spinner/Spinner";
import dayjs from "dayjs";
import EventDeleteButton from "../../Buttons/EventDeleteButton";
import { canCreateEventOnDate, createDateAsUTC, isDateValid } from "../../../utils/dates";
import { IEvenement, IPartialEvenement } from "../../../api/ApiTypeHelpers";
import { queryClient } from "../../../App";
import { EvenementEtatItem } from "../../Items/EvenementEtatItem";
import EventCopyButton from "../../Buttons/EventCopyButton";
import GestionnaireItem from "../../Items/GestionnaireItem";
import {
   PREFETCH_LAST_PERIODES_RH,
   PREFETCH_TYPES_EVENEMENTS,
} from "../../../api/ApiPrefetchHelpers";

interface IEvenementModal {
   id?: string;
   initialEvenement?: IEvenement;
}

/**
 * Open a modal to display and edit information about an event.
 *
 * @param {Object} options - The options for the event modal.
 * @param {string} [options.id] - The ID of the event.
 * @param {Evenement} [options.initialEvenement] - The initial event object.
 *
 * @returns {ReactElement}
 */
export default function EvenementModal({ id, initialEvenement }: IEvenementModal): ReactElement {
   const { message, notification } = App.useApp();
   const [evenementId, setEvenementId] = useState(id);
   const [evenement, setEvenement] = useState<Evenement | undefined>();
   const [formIsDirty, setFormIsDirty] = useState(false);
   const dispatch = useDispatch();
   const [form] = Form.useForm<Evenement | undefined>();
   const auth = useAuth();

   // Dernière période dont la date butoir est dépassée
   const { data: lastPeriodes } = useApi().useGetCollection(PREFETCH_LAST_PERIODES_RH(auth.user));

   function resetSourceEvenement() {
      setEvenement(undefined);
      form.resetFields();
   }

   const handleClose = () => {
      if (evenementId) queryClient.removeQueries({ queryKey: [evenementId] });
      setEvenementId(undefined);
      resetSourceEvenement();

      dispatch(setModalEvenementId(undefined));
      dispatch(setModalEvenement(undefined));
   };

   const updateSourceEvenement = useCallback(
      (values: IPartialEvenement | undefined, forceResetForm = false) => {
         setEvenement((prev) => {
            const evt = new Evenement({
               beneficiaires: [""],
               ...prev,
               ...values,
            } as IEvenement);

            if (forceResetForm) form.resetFields();
            form.setFieldsValue(evt);
            return evt;
         });
      },
      [form],
   );

   // GET /evenements/{id}
   const { data: evenementData, isFetching: isFetchingEvenement } =
      useApi().useGetItem<"/evenements/{id}">({
         path: "/evenements/{id}",
         url: evenementId as string,
         enabled: !!evenementId,
      });

   useEffect(() => {
      if (evenementData) {
         updateSourceEvenement(evenementData);
      }
   }, [evenementData, updateSourceEvenement]);

   // Mutation d'un évènement
   const patchEvenement = useApi().usePatch({
      path: "/evenements/{id}",
      invalidationQueryKeys: ["/evenements", "/statistiques_evenements"],
      onSuccess: () => {
         message.success("Évènement modifié").then();
         handleClose();
      },
   });

   const postEvenement = useApi().usePost({
      path: "/evenements",
      invalidationQueryKeys: ["/evenements", "/statistiques_evenements"],
      onSuccess: () => {
         message.success("Évènement créé").then();
         handleClose();
      },
   });

   const { data: typesEvenements, isFetching: isFetchingType } =
      useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);

   // -------- INITIALISATION --------

   // Initialisation via props : id
   useEffect(() => {
      setEvenementId(id);
   }, [id]);

   // Initialisation via props : initialEvenement
   useEffect(() => {
      if (initialEvenement) {
         updateSourceEvenement(initialEvenement, true);
      }
   }, [updateSourceEvenement, initialEvenement]);

   // -------- EVENEMENT --------

   const handleDelete = () => {
      resetSourceEvenement();
      setEvenementId(undefined);
      handleClose();
   };

   if (!evenement) return <Form form={form} className="d-none" />;

   if (isFetchingEvenement)
      return (
         <Form form={form} className="d-flex-center">
            <Spinner size={100} />
         </Form>
      );

   function handleCreateOrUpdateEvenement(values: IEvenement | undefined) {
      if (!values) return;

      // On met les dates au format ISO
      const data = {
         ...evenement,
         ...values,
         debut: createDateAsUTC(new Date(values.debut)).toISOString(),
         fin: createDateAsUTC(new Date(values.fin)).toISOString(),
         beneficiaires: values.beneficiaires?.filter((b) => b),
         intervenant: values.intervenant ? values.intervenant : null,
      };

      if (!data["@id"]) {
         // Nouvel évènement
         postEvenement.mutate({
            data,
         });
      } else {
         // Modification d'un évènement
         patchEvenement.mutate({
            "@id": evenement?.["@id"] as string,
            data,
         });
      }
   }

   // noinspection PointlessBooleanExpressionJS
   return (
      <Modal
         key={evenement["@id"] || "evenenement-modal"}
         destroyOnHidden
         open={evenement !== undefined}
         width="66%"
         className="oasis-modal"
         onCancel={handleClose}
         onOk={handleClose}
         cancelButtonProps={{ style: { display: "none" } }}
         title={
            isFetchingType ? (
               "Détails de l'évènement"
            ) : (
               <>
                  {evenement?.libelle ||
                     typesEvenements?.items.find((t) => t["@id"] === evenement.type)?.libelle ||
                     "Nouvel évènement"}
                  <div className="float-right">
                     <EvenementEtatItem
                        evenement={evenement}
                        type={typesEvenements?.items.find((t) => t["@id"] === evenement.type)}
                        style={{ marginRight: 32 }}
                     />
                  </div>
               </>
            )
         }
         footer={
            <Row>
               <Col xs={8} sm={8} lg={12} className="text-left">
                  <Space>
                     {evenement["@id"] && (
                        <EventDeleteButton evenement={evenement} onDelete={handleDelete} />
                     )}
                     <EventCopyButton
                        evenement={evenement}
                        onCopy={() => {
                           notification.success({
                              title: "Informations de l'évènement copiées dans le presse-papier",
                           });
                        }}
                     />
                  </Space>
               </Col>
               <Col xs={16} sm={16} lg={12} className="text-right">
                  <Space>
                     <Button onClick={() => handleClose()}>Annuler</Button>
                     <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
                        Enregistrer
                     </Button>
                  </Space>
               </Col>
            </Row>
         }
      >
         <Form<Evenement | undefined>
            form={form}
            layout="vertical"
            onFinish={(values) => {
               handleCreateOrUpdateEvenement(values);
               handleClose();
            }}
            onFinishFailed={(errorInfo) => {
               console.log("Failed:", errorInfo);
               errorInfo.errorFields.forEach((error) => {
                  form.scrollToField(error.name);
                  message.error(error.errors[0]).then();
               });
            }}
            disabled={
               !auth.user?.isPlanificateur ||
               evenement?.dateEnvoiRH !== undefined ||
               evenement?.dateValidation !== undefined ||
               (evenement?.debut !== undefined &&
                  evenement?.debut !== "" &&
                  !canCreateEventOnDate(
                     new Date(evenement.debut),
                     auth.user,
                     lastPeriodes?.items[0],
                  ))
            }
            onValuesChange={(changedValues) => {
               setFormIsDirty(true);
               updateSourceEvenement(changedValues);
            }}
         >
            <Tabs
               type="card"
               defaultActiveKey="informations"
               items={[
                  {
                     key: "informations",
                     label: `Informations`,
                     children: (
                        <TabEvenementInformations
                           evenement={evenement}
                           formIsDirty={formIsDirty}
                           setEvenement={updateSourceEvenement}
                        />
                     ),
                  },
                  {
                     key: "amenagements-examens",
                     label: `Aménagements d'examens`,
                     children: <TabEquipement />,
                  },
                  {
                     key: "paiement",
                     label: `Paiement`,
                     children: (
                        <TabPaiement
                           form={form}
                           evenement={evenement}
                           setEvenement={updateSourceEvenement}
                        />
                     ),
                     disabled: !isDateValid(evenement?.debut) || !isDateValid(evenement?.fin),
                  },
               ]}
               className="tab-bordered tab-overflow-70vh mt-3"
            />

            <Row className="mb-3">
               <Col span={24} className="legende mt-1">
                  Créé le {dayjs(evenement.dateCreation).format("DD/MM/YYYY")}
                  {evenement.utilisateurCreation && (
                     <>
                        {" "}
                        par{" "}
                        <GestionnaireItem
                           gestionnaireId={evenement.utilisateurCreation}
                           showAvatar={false}
                        />
                     </>
                  )}
                  {evenement.dateModification && (
                     <>
                        {" "}
                        &bull; Dernière modification le{" "}
                        {dayjs(evenement.dateModification).format("DD/MM/YYYY")}
                        {evenement.utilisateurModification && (
                           <>
                              {" "}
                              par{" "}
                              <GestionnaireItem
                                 gestionnaireId={evenement.utilisateurModification}
                                 showAvatar={false}
                              />
                           </>
                        )}
                     </>
                  )}
               </Col>
            </Row>
         </Form>
      </Modal>
   );
}
