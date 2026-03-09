/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo } from "react";
import { CalendarEvenement, Evenement } from "../../../lib/Evenement";
import { DeleteFilled, MinusOutlined, ToolOutlined, WarningFilled } from "@ant-design/icons";
import { Alert, App, Popover, Space, Tooltip } from "antd";
import moment from "moment";
import TypeEvenementItem from "../../Items/TypeEvenementItem";
import CampusItem from "../../Items/CampusItem";
import { IModals } from "../../../redux/context/IModals";
import { useSelector } from "react-redux";
import { IStore } from "../../../redux/Store";
import { IAccessibilite } from "../../../redux/context/IAccessibilite";
import { useApi } from "../../../context/api/ApiProvider";
import { TYPE_EVENEMENT_RENFORT } from "../../../constants";
import EventCopyButton from "../../Buttons/EventCopyButton";
import TypeEquipementItem from "../../Items/TypeEquipementItem";
import {
   PREFETCH_CAMPUS,
   PREFETCH_TYPES_EQUIPEMENTS,
   PREFETCH_TYPES_EVENEMENTS,
} from "../../../api/ApiPrefetchHelpers";
import GestionnaireItem from "../../Items/GestionnaireItem";
import { UtilisateurAsString } from "../../Items/UtilisateurAsString";
import EtudiantItem from "../../Items/EtudiantItem";
import { RoleValues } from "../../../lib/Utilisateur";
import { EllipsisMiddle } from "../../Typography/EllipsisMiddle";

/**
 * Display a calendar event in a popover.
 *
 * @param {Object} param - The parameter object.
 * @param {memo<ReactElement>} param.event - The calendar event to display.
 */
export default memo(
   function CalendarEvent({ event }: { event: CalendarEvenement }) {
      const appModals: IModals = useSelector(({ modals }: Partial<IStore>) => modals) as IModals;
      const appAccessibilite: IAccessibilite = useSelector(
         ({ accessibilite }: Partial<IStore>) => accessibilite,
      ) as IAccessibilite;
      const { data: intervenant } = useApi().useGetItem({
         path: "/utilisateurs/{uid}",
         url: event.data.intervenant as string,
         enabled: !!event.data.intervenant,
      });
      const { data: dataCampus } = useApi().useGetCollection(PREFETCH_CAMPUS);
      const { data: typesEvenements } = useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);
      const { data: equipements } = useApi().useGetCollection(PREFETCH_TYPES_EQUIPEMENTS);
      const { notification } = App.useApp();

      /**
       * Retrieves the accessible description of an event.
       *
       * @returns {string} The description of the event.
       */
      function getDescriptionAccessible(): string {
         const evenement: Evenement = event.data;
         const type = typesEvenements?.items.find((t) => t["@id"] === evenement.type);

         // Libellé
         let title = `Évènement ${evenement.libelle || type?.libelle || "sans titre"} du ${moment(
            evenement.debut,
         ).format("dddd DD MMMM YYYY")} de ${moment(evenement.debut).format("HH:mm")} à ${moment(
            evenement.fin,
         ).format("HH:mm")}. `;

         // Bénéficiaires
         if (evenement.beneficiaires && evenement.beneficiaires.length > 0) {
            if (evenement.beneficiaires.length === 1) {
               title += `Le bénéficiaire de cet évènement est : ${UtilisateurAsString({
                  utilisateurId: evenement.beneficiaires[0],
               })}. `;
            } else {
               title += `Les bénéficiaires de cet évènement sont : ${evenement.beneficiaires
                  .map((b) => {
                     return UtilisateurAsString({ utilisateurId: b }) || "";
                  })
                  .join(", ")}. `;
            }
         } else {
            title += `Aucun bénéficiaire n'est lié à cet évènement. `;
         }

         // Intervenant
         if (evenement.type !== TYPE_EVENEMENT_RENFORT) {
            if (evenement.intervenant && intervenant) {
               title += `L'intervenant de cet évènement est ${intervenant.prenom} ${intervenant.nom}. `;
            } else {
               title += `L'intervenant de cet évènement n'a pas été défini pour le moment. `;
            }
         }

         // Enseignants
         if (evenement.enseignants && evenement.enseignants.length > 0) {
            if (evenement.enseignants.length === 1) {
               title += `L'enseignant de cet évènement est ${
                  UtilisateurAsString({ utilisateurId: evenement.enseignants[0] }) || ""
               }. `;
            } else {
               title += `Les enseignants de cet évènement sont : ${evenement.enseignants
                  .map((b) => {
                     return UtilisateurAsString({ utilisateurId: b }) || "";
                  })
                  .join(", ")}. `;
            }
         } else {
            title += `Aucun enseignant n'est lié à cet évènement. `;
         }

         // Localisation
         if (evenement.campus && dataCampus) {
            title += `L'évènement se déroulera sur le campus ${
               dataCampus.items.find((c) => c["@id"] === evenement.campus)?.libelle
            }, salle ${evenement.salle || "non définie pour le moment"}. `;
         }

         // Equipements
         if (evenement.equipements && evenement.equipements.length > 0 && equipements) {
            title += `Les aménagements suivants sont liés à l'évènement : ${evenement.equipements
               .map((e) => equipements.items.find((eq) => eq["@id"] === e)?.libelle)
               .join(", ")}. `;
         }

         return title;
      }

      return (
         <Popover
            key={event.data["@id"]}
            open={
               appModals.EVENEMENT_ID !== undefined || appModals.EVENEMENT !== undefined
                  ? false
                  : undefined
            }
            mouseEnterDelay={0.15}
            title={
               <h3 className="mt-1">
                  <EllipsisMiddle
                     content={event.data.libelle || "Évènement"}
                     suffixCount={15}
                     style={{ maxWidth: "90%" }}
                  />
               </h3>
            }
            placement="left"
            content={
               <div>
                  {event.data.dateAnnulation && (
                     <Alert
                        title="Évènement annulé"
                        description="L'intervenant sera tout de même payé."
                        type="warning"
                        showIcon
                        className="mb-2"
                     />
                  )}
                  {!event.data.isAffecte() && (
                     <Alert
                        title="Évènement en attente d'affectation"
                        description="Aucun intervenant n'est affecté à cet évènement."
                        type="error"
                        showIcon
                        className="mb-2"
                     />
                  )}
                  <Space orientation="vertical" size="small">
                     <Space size="large">
                        <div style={{ width: 100 }}>Date</div>
                        <span className="light">
                           {moment(event.data.debut).format("dddd DD MMM YYYY")}
                        </span>
                     </Space>
                     <Space size="large">
                        <div style={{ width: 100 }}>Horaires</div>
                        <span className="light">
                           de {moment(event.data.debut).format("HH:mm")} à{" "}
                           {moment(event.data.fin).format("HH:mm")}
                        </span>
                     </Space>
                     <Space size="large">
                        <div style={{ width: 100 }}>Catégorie</div>
                        <span className="light">
                           <TypeEvenementItem
                              typeEvenementId={event.data.type}
                              forceBlackText={appAccessibilite.contrast}
                           />
                        </span>
                     </Space>
                     {event.data.type !== TYPE_EVENEMENT_RENFORT && (
                        <Space size="large">
                           <div style={{ width: 100 }}>Bénéficiaire</div>
                           <Space orientation="vertical" className="light">
                              {event.data.beneficiaires?.map((b) => (
                                 <EtudiantItem
                                    key={b}
                                    utilisateurId={b}
                                    showTelephone
                                    role={RoleValues.ROLE_BENEFICIAIRE}
                                 />
                              ))}
                           </Space>
                        </Space>
                     )}
                     <Space size="large">
                        <div style={{ width: 100 }}>
                           {event.data.type === TYPE_EVENEMENT_RENFORT ? "Renfort" : "Intervenant"}
                        </div>
                        <span className="light">
                           <EtudiantItem
                              utilisateurId={event.data.intervenant}
                              showTelephone
                              role={RoleValues.ROLE_INTERVENANT}
                           />
                        </span>
                     </Space>
                     <Space size="large">
                        <div style={{ width: 100 }}>
                           Enseignant{(event.data.enseignants?.length || 0) > 1 ? "s" : ""}
                        </div>
                        <span className="light">
                           <Space orientation="vertical">
                              {event.data.enseignants?.map((b) => (
                                 <GestionnaireItem key={b} gestionnaireId={b} />
                              )) || <MinusOutlined />}
                           </Space>
                        </span>
                     </Space>
                     <Space size="large">
                        <div style={{ width: 100 }}>Localisation</div>
                        <Space orientation="horizontal">
                           <CampusItem className="light" campusId={event.data.campus} />
                           {event.data.salle && (
                              <>
                                 <span>/</span>
                                 <span className="light">{event.data.salle}</span>
                              </>
                           )}
                        </Space>
                     </Space>

                     <Space size="large">
                        <div style={{ width: 100 }}>Equipements</div>
                        <Space orientation="vertical" className="light">
                           {event.data.equipements?.map((e) => (
                              <TypeEquipementItem key={e} typeEquipementId={e} />
                           ))}
                        </Space>
                     </Space>
                  </Space>
                  <div className="event-commands mt-1">
                     <div className="text-right w-100">
                        <EventCopyButton
                           evenement={event.data}
                           onCopy={() => {
                              notification.success({
                                 message:
                                    "Informations de l'évènement copiées dans le presse-papier",
                              });
                           }}
                        />
                     </div>
                  </div>
               </div>
            }
         >
            <div style={{ height: "100%" }} tabIndex={0} aria-label={getDescriptionAccessible()}>
               <div className="libelle-evenement">
                  {event.data.libelle ? (
                     event.data.libelle
                  ) : (
                     <TypeEvenementItem
                        typeEvenementId={event.data.type}
                        showAvatar={false}
                        forceBlackText={!event.data.isAffecte()}
                     />
                  )}
               </div>

               <Space className="note-bottom">
                  {(event.data.equipements || []).length > 0 && (
                     <Tooltip title="Equipement nécessaire">
                        <ToolOutlined />
                     </Tooltip>
                  )}
                  {event.data.dateAnnulation && (
                     <Tooltip title="Évènement annulé">
                        <DeleteFilled className="text-warning" />
                     </Tooltip>
                  )}
                  {!event.data.isAffecte() && !event.data.dateAnnulation && (
                     <Tooltip title="Évènement à affecter">
                        <WarningFilled className="text-danger" />
                     </Tooltip>
                  )}
               </Space>
            </div>
         </Popover>
      );
   },
   (prevProps, nextProps) => {
      return JSON.stringify(prevProps.event.data) === JSON.stringify(nextProps.event.data);
   },
);
