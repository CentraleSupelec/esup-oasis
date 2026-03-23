/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import {
   Alert,
   Button,
   Col,
   Empty,
   Form,
   List,
   message,
   Modal,
   notification,
   Row,
   Switch,
} from "antd";
import { Calendar, Day } from "../../../lib/react-modern-calendar-datepicker";
import { modernCalendarLocaleFr } from "../../../lib/react-modern-calendar-datepicker/SmallCalendarLocale";
import { createDateAsUTC, toDate, toDayValue } from "../../../utils/dates";
import { DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Evenement } from "../../../lib/Evenement";
import { useApi } from "../../../context/api/ApiProvider";
import { queryClient } from "../../../App";
import { arrayContainsDuplicates } from "../../../utils/array";
import { useAuth } from "../../../auth/AuthProvider";
import { TYPE_EVENEMENT_RENFORT } from "../../../constants";
import { PREFETCH_LAST_PERIODES_RH } from "../../../api/ApiPrefetchHelpers";
import { IEvenement } from "../../../api/ApiTypeHelpers";

import { UseStateDispatch } from "../../../utils/utils";

interface IEvenementDupliquerDrawer {
   evenement: Evenement;
   open: boolean;
   setOpen: UseStateDispatch<boolean>;
}

interface IDuplicationOptions {
   horaire: boolean;
   typeEvenement: boolean;
   beneficiaire: boolean;
   intervenant: boolean;
   suppleants: boolean;
   campus: boolean;
   salle: boolean;
   equipements: boolean;
   paiement: boolean;
}

/**
 * Duplicate an event on multiple days.
 *
 * @param {IEvenementDupliquerDrawer} params - The parameters for duplicating the event.
 * @param {IEvenement} params.evenement - The event to duplicate.
 * @param {boolean} params.open - Whether the modal is open.
 * @param {Function} params.setOpen - Function to set the open state of the modal.
 *
 * @return {ReactElement} The modal JSX element for duplicating the event.
 */
export default function EvenementDupliquerModal({
   evenement,
   open,
   setOpen,
}: IEvenementDupliquerDrawer): ReactElement {
   const user = useAuth().user;
   // Dernière période dont la date butoir est dépassée
   const { data: lastPeriodes } = useApi().useGetCollection(PREFETCH_LAST_PERIODES_RH(user));

   const [form] = Form.useForm();
   const [afficherAide, setAfficherAide] = useState(false);
   const [datesSelectionnees, setDatesSelectionnees] = useState<Date[]>([]);
   const [submitted, setSubmitted] = useState(false);
   const [options, setOptions] = useState<IDuplicationOptions>({
      horaire: true,
      typeEvenement: true,
      beneficiaire: true,
      intervenant: evenement.type === TYPE_EVENEMENT_RENFORT,
      suppleants: false,
      campus: true,
      salle: false,
      equipements: true,
      paiement: false,
   });
   const postEvenement = useApi().usePost({
      path: "/evenements",
      onSuccess: () => {
         window.setTimeout(() => {
            // Remove first element of datesSelectionnees
            setDatesSelectionnees((prev) => prev.slice(1));
         }, 500);
      },
   });

   const handleClose = () => {
      setOpen(() => {
         queryClient.invalidateQueries({ queryKey: ["/evenements"] }).then();
         queryClient.invalidateQueries({ queryKey: ["/statistiques_evenements"] }).then();
         return false;
      });
   };

   function postEvenementDuplique() {
      if (datesSelectionnees.length > 0) {
         const date = datesSelectionnees[0];
         const debut = new Date(date);
         debut.setHours(
            evenement.debutDate()?.getHours() || 0,
            evenement.debutDate()?.getMinutes(),
         );
         const fin = new Date(date);
         fin.setHours(evenement.finDate()?.getHours() || 0, evenement.finDate()?.getMinutes());

         const nvoEvenement: IEvenement = {
            id: undefined,
            "@id": undefined,
            debut: createDateAsUTC(debut).toISOString(),
            fin: createDateAsUTC(fin).toISOString(),
            libelle: evenement.libelle,
            campus: evenement.campus,
            type: evenement.type,
            beneficiaires: options.beneficiaire ? evenement.beneficiaires : undefined,
            intervenant: options.intervenant ? evenement.intervenant : undefined,
            suppleants: options.suppleants ? evenement.suppleants : undefined,
            salle: options.salle ? evenement.salle : undefined,
            equipements: options.equipements ? evenement.equipements : undefined,
            tempsPreparation: options.paiement ? evenement.tempsPreparation : undefined,
            tempsSupplementaire: options.paiement ? evenement.tempsSupplementaire : undefined,
         };

         postEvenement.mutate({
            data: nvoEvenement,
         });
      } else {
         message.success("Évènement dupliqué avec succès").then();
         setSubmitted(false);
         handleClose();
      }
   }

   useEffect(() => {
      if (submitted) {
         postEvenementDuplique();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [submitted, datesSelectionnees]);

   const handleSubmit = (values: IDuplicationOptions) => {
      if (
         arrayContainsDuplicates(datesSelectionnees.map((d) => d.toISOString())) &&
         (values.intervenant || values.beneficiaire)
      ) {
         notification.error({
            message: "Duplication impossible",
            description:
               "Vous ne pouvez pas dupliquer un évènement sur le même jour avec un intervenant ou un bénéficiaire. Un utilisateur ne peut avoir 2 évènements sur le même créneau horaire.",
         });
         return;
      }
      setSubmitted(() => {
         setOptions(values);
         return true;
      });
   };

   return (
      <Modal
         destroyOnHidden
         title={
            <>
               {!afficherAide && (
                  <Button
                     className="float-right mr-5 p-0"
                     icon={<QuestionCircleOutlined />}
                     onClick={() => setAfficherAide(true)}
                     type="link"
                     style={{ marginTop: -7 }}
                  >
                     Aide
                  </Button>
               )}
               {"Dupliquer un évènement".toLocaleUpperCase()}
            </>
         }
         onOk={() => form.submit()}
         onCancel={handleClose}
         okButtonProps={{
            disabled: datesSelectionnees.length === 0,
         }}
         okText="Dupliquer"
         open={open}
         className="oasis-drawer"
         width={800}
         confirmLoading={submitted}
      >
         {afficherAide && (
            <Alert
               closable={{ onClose: () => setAfficherAide(false) }}
               title="Dupliquer un évènement"
               description={
                  <>
                     Cette fonctionnalité vous permet de dupliquer un évènement sur plusieurs jours.
                     Vous devez :
                     <ol className="mt-0 mb-0">
                        <li>
                           Sélectionner les jours sur lesquels vous souhaitez copier l'évènement
                           dans le calendrier à gauche
                        </li>
                        <li>
                           Sélectionner dans la partie de droite les informations de l'évènement que
                           vous souhaitez conserver dans les évènements à créer
                        </li>
                     </ol>
                  </>
               }
               type="info"
               showIcon
               className="mb-2"
            />
         )}
         <Form
            form={form}
            layout="vertical"
            name="evenement-dupliquer"
            onFinish={handleSubmit}
            initialValues={options}
         >
            <Row gutter={[16, 16]}>
               <Col lg={12} sm={24}>
                  <Calendar
                     calendarClassName="small-calendar pr-2"
                     shouldHighlightWeekends
                     locale={modernCalendarLocaleFr}
                     minimumDate={
                        user?.isAdmin || !lastPeriodes || !lastPeriodes.items[0]
                           ? undefined
                           : (toDayValue(new Date(lastPeriodes.items[0].butoir as string)) as Day)
                     }
                     onChange={(v) => {
                        if (v) {
                           // Pas de doublons sur les dates car un bénéf ne peut pas avoir 2 évènements sur le même créneau horaire
                           if (
                              datesSelectionnees
                                 .map((d) => d.toISOString())
                                 .includes(toDate(v).toISOString())
                           )
                              return;

                           setDatesSelectionnees([...datesSelectionnees, toDate(v)]);
                        }
                     }}
                  />

                  <p className="semi-bold mt-0">Date des évènements à créer</p>
                  {datesSelectionnees.length > 0 ? (
                     <List size="small">
                        {datesSelectionnees.map((date, index) => (
                           <List.Item
                              key={index}
                              extra={
                                 <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                       setDatesSelectionnees(
                                          datesSelectionnees.filter((d) => d !== date),
                                       );
                                    }}
                                 />
                              }
                           >
                              {date.toLocaleDateString()}
                           </List.Item>
                        ))}
                     </List>
                  ) : (
                     <Empty description="Aucune date sélectionnée" />
                  )}
               </Col>
               <Col lg={12} sm={24}>
                  <p className="semi-bold">Informations à dupliquer</p>
                  <Row>
                     <Col span={18} className="text-legende">
                        Horaires (début/fin)
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="horaire" valuePropName="checked">
                           <Switch size="small" checked disabled className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>
                  <Row>
                     <Col span={18} className="text-legende">
                        Catégorie
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="typeEvenement" valuePropName="checked">
                           <Switch size="small" checked disabled className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18} className="text-legende">
                        Bénéficiaire
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="beneficiaire" valuePropName="checked">
                           <Switch size="small" checked={true} disabled className="mb-1" />
                        </Form.Item>
                     </Col>

                     <Col
                        span={18}
                        className={
                           evenement.type === TYPE_EVENEMENT_RENFORT ? "text-legende" : undefined
                        }
                     >
                        Intervenant
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="intervenant" valuePropName="checked">
                           <Switch
                              size="small"
                              checked={evenement.type === TYPE_EVENEMENT_RENFORT ? true : undefined}
                              disabled={evenement.type === TYPE_EVENEMENT_RENFORT}
                              className="mb-1"
                           />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18} className="text-legende">
                        Campus
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="campus" valuePropName="checked">
                           <Switch size="small" checked={true} disabled className="mb-1" />
                        </Form.Item>
                     </Col>

                     <Col span={18}>Salle</Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="salle" valuePropName="checked">
                           <Switch size="small" className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18}>Equipements</Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="equipements" valuePropName="checked">
                           <Switch size="small" className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18}>Informations de paiement</Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="paiement" valuePropName="checked">
                           <Switch size="small" className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>
               </Col>
            </Row>
         </Form>
      </Modal>
   );
}
