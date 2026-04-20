/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import {
   Alert,
   Button,
   Col,
   DatePicker,
   Empty,
   Form,
   List,
   Modal,
   notification,
   Row,
   Switch,
} from "antd";
import { createDateAsUTC } from "../../../utils/dates";
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
import dayjs, { Dayjs } from "dayjs";

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
   const [datesSelectionnees, setDatesSelectionnees] = useState<Dayjs[]>([]);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const postEvenement = useApi().usePost({
      path: "/evenements",
   });

   const handleClose = () => {
      queryClient.invalidateQueries({ queryKey: ["/evenements"] }).then();
      queryClient.invalidateQueries({ queryKey: ["/statistiques_evenements"] }).then();
      setOpen(false);
   };

   async function handleSubmit(values: IDuplicationOptions) {
      if (
         arrayContainsDuplicates(datesSelectionnees.map((d) => d.format("YYYY-MM-DD"))) &&
         (values.intervenant || values.beneficiaire)
      ) {
         notification.error({
            title: "Duplication impossible",
            description:
               "Vous ne pouvez pas dupliquer un évènement sur le même jour avec un intervenant ou un bénéficiaire. Un utilisateur ne peut avoir 2 évènements sur le même créneau horaire.",
         });
         return;
      }

      setIsSubmitting(true);
      try {
         const datesToProcess = [...datesSelectionnees];
         while (datesToProcess.length > 0) {
            const date = datesToProcess[0];
            const debut = dayjs(date)
               .hour(evenement.debutDate()?.getHours() || 0)
               .minute(evenement.debutDate()?.getMinutes() || 0)
               .second(0)
               .millisecond(0);

            const fin = dayjs(date)
               .hour(evenement.finDate()?.getHours() || 0)
               .minute(evenement.finDate()?.getMinutes() || 0)
               .second(0)
               .millisecond(0);

            const nvoEvenement: IEvenement = {
               debut: createDateAsUTC(debut.toDate()).toISOString(),
               fin: createDateAsUTC(fin.toDate()).toISOString(),
               libelle: evenement.libelle,
               campus: evenement.campus,
               type: evenement.type,
               beneficiaires: values.beneficiaire ? evenement.beneficiaires : undefined,
               intervenant: values.intervenant ? evenement.intervenant : undefined,
               suppleants: values.suppleants ? evenement.suppleants : undefined,
               salle: values.salle ? evenement.salle : undefined,
               equipements: values.equipements ? evenement.equipements : undefined,
               tempsPreparation: values.paiement ? evenement.tempsPreparation : undefined,
               tempsSupplementaire: values.paiement ? evenement.tempsSupplementaire : undefined,
            };

            await postEvenement.mutateAsync({
               data: nvoEvenement,
            });

            datesToProcess.shift();
            setDatesSelectionnees([...datesToProcess]);
         }

         notification.success({ message: "Évènement dupliqué avec succès" });
         handleClose();
      } catch (e) {
         notification.error({
            title: "Erreur lors de la duplication",
            description: "Certains évènements n'ont pas pu être créés.",
         });
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <Modal
         destroyOnClose
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
         confirmLoading={isSubmitting}
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
            initialValues={{
               horaire: true,
               typeEvenement: true,
               beneficiaire: true,
               intervenant: evenement.type === TYPE_EVENEMENT_RENFORT,
               suppleants: false,
               campus: true,
               salle: false,
               equipements: true,
               paiement: false,
            }}
         >
            <Row gutter={[16, 16]}>
               <Col lg={12} sm={24}>
                  <DatePicker
                     multiple
                     value={datesSelectionnees}
                     onChange={(dates) => {
                        setDatesSelectionnees(dates || []);
                     }}
                     maxTagCount="responsive"
                     className={"mb-3"}
                     placeholder={"Sélectionnez une ou plusieurs dates"}
                     format="DD/MM/YYYY"
                     minDate={
                        user?.isAdmin || !lastPeriodes || !lastPeriodes.items[0]
                           ? undefined
                           : dayjs(lastPeriodes.items[0].butoir as string)
                     }
                  />
                  <p className="semi-bold mt-0">Date des évènements à créer</p>
                  {datesSelectionnees.length > 0 ? (
                     <List size="small">
                        {datesSelectionnees.map((date) => (
                           <List.Item
                              key={date.toISOString()}
                              extra={
                                 <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                       setDatesSelectionnees(
                                          datesSelectionnees.filter((d) => !d.isSame(date, "day")),
                                       );
                                    }}
                                 />
                              }
                           >
                              {date.format("DD/MM/YYYY")}
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
                           <Switch size="small" disabled className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>
                  <Row>
                     <Col span={18} className="text-legende">
                        Catégorie
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="typeEvenement" valuePropName="checked">
                           <Switch size="small" disabled className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18} className="text-legende">
                        Bénéficiaire
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="beneficiaire" valuePropName="checked">
                           <Switch size="small" disabled className="mb-1" />
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
                           <Switch size="small" disabled className="mb-1" />
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
