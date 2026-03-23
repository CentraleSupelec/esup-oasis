/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

import { IDemande, ITypeDemande } from "../api/ApiTypeHelpers";
import CampagneDemandeDateItem from "../controls/Items/CampagneDemandeDateItem";
import React from "react";
import { Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import {
   CheckCircleOutlined,
   CloseCircleOutlined,
   EditOutlined,
   FileDoneOutlined,
   FileExclamationOutlined,
   HourglassOutlined,
   PaperClipOutlined,
} from "@ant-design/icons";
import { env } from "../env";

export interface EtatInfo {
   id: string;
   // libelle: string;
   description: string;
   etape: string;
   icone: React.ReactElement;
   ordre: number;
   color: string | undefined;
   conformite?: boolean;
   gestionnairePeutModifier: boolean;
   afficherMessageSuiviEmail: boolean;
   afficherDerniereModif: boolean;
   etapeIndex: number;
   hexColor?: string;
}

export const ETAT_DEMANDE_EN_COURS = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/1`;
export const ETAT_DEMANDE_RECEPTIONNEE = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/2`;
export const ETAT_DEMANDE_CONFORME = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/3`;
export const ETAT_DEMANDE_NON_CONFORME = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/8`;
export const ETAT_DEMANDE_ATTENTE_COMMISSION = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/7`;
export const ETAT_DEMANDE_PROFIL_ACCEPTE = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/6`;
export const ETAT_DEMANDE_VALIDEE = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/4`;
export const ETAT_DEMANDE_REFUSEE = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/5`;
export const ETAT_ATTENTE_CHARTES = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/9`;
export const ETAT_ATTENTE_ACCOMPAGNEMENT = `${process.env.REACT_APP_API_PREFIX}/etats_demandes/10`;

export const ETATS_DEMANDES: EtatInfo[] = [
   {
      id: ETAT_DEMANDE_EN_COURS,
      etape: "A",
      // libelle: "En cours de saisie",
      description:
         "{Article} demande est en cours de saisie, elle n'a pas été envoyée au service {service}.",
      icone: <EditOutlined aria-hidden />,
      ordre: 0,
      color: undefined,
      hexColor: "#999",
      conformite: undefined,
      gestionnairePeutModifier: true,
      afficherMessageSuiviEmail: false,
      afficherDerniereModif: false,
      etapeIndex: 0,
   },
   {
      id: ETAT_DEMANDE_RECEPTIONNEE,
      etape: "A",
      // libelle: "Receptionnée",
      description:
         "{Article} demande a été reçue par le service {service}, elle est en cours de traitement.",
      icone: <HourglassOutlined aria-hidden />,
      ordre: 10,
      color: "purple",
      hexColor: "#531dab",
      conformite: undefined,
      gestionnairePeutModifier: true,
      afficherMessageSuiviEmail: true,
      afficherDerniereModif: false,
      etapeIndex: 1,
   },
   {
      id: ETAT_DEMANDE_CONFORME,
      etape: "B",
      // libelle: "Conforme",
      description:
         "Les informations de {article} demande sont conformes, elle sera bientôt examinée.",
      icone: <FileDoneOutlined aria-hidden />,
      ordre: 20,
      color: "blue",
      hexColor: "#0958d9",
      conformite: true,
      gestionnairePeutModifier: true,
      afficherMessageSuiviEmail: true,
      afficherDerniereModif: false,
      etapeIndex: 2,
   },
   {
      id: ETAT_DEMANDE_NON_CONFORME,
      etape: "B",
      // libelle: "Non conforme",
      description:
         "Les informations de {article} demande ne sont pas conformes. Vous devez corriger votre demande.",
      icone: <FileExclamationOutlined aria-hidden />,
      ordre: 21,
      color: "volcano",
      hexColor: "#d4380d",
      conformite: false,
      gestionnairePeutModifier: true,
      afficherMessageSuiviEmail: false,
      afficherDerniereModif: true,
      etapeIndex: 2,
   },
   {
      id: ETAT_DEMANDE_ATTENTE_COMMISSION,
      etape: "C",
      // libelle: "En attente commission",
      description: "{Article} demande est en cours d'examen par la commission.",
      icone: <PaperClipOutlined aria-hidden />,
      ordre: 30,
      color: "blue",
      hexColor: "#007CBD",
      conformite: true,
      gestionnairePeutModifier: false,
      afficherMessageSuiviEmail: true,
      afficherDerniereModif: false,
      etapeIndex: 3,
   },

   {
      id: ETAT_ATTENTE_CHARTES,
      etape: "D",
      // libelle: "Attente acceptation chartes",
      description: "L'acceptation de la charte est nécessaire pour valider {article} demande.",
      icone: <HourglassOutlined aria-hidden />,
      ordre: 40,
      color: "orange",
      hexColor: "#f0cf6c",
      conformite: true,
      gestionnairePeutModifier: false,
      afficherMessageSuiviEmail: false,
      afficherDerniereModif: false,
      etapeIndex: 3,
   },

   {
      id: ETAT_DEMANDE_PROFIL_ACCEPTE,
      etape: "D",
      // libelle: "Profil accepté",
      description:
         "{Article} demande de profil a été acceptée, des instructions {contexte}ont été transmises par email.",
      icone: <PaperClipOutlined aria-hidden />,
      ordre: 42,
      color: "green",
      hexColor: "#8fcb77",
      conformite: true,
      gestionnairePeutModifier: false,
      afficherMessageSuiviEmail: true,
      afficherDerniereModif: false,
      etapeIndex: 3,
   },

   {
      id: ETAT_ATTENTE_ACCOMPAGNEMENT,
      etape: "D",
      // libelle: "Attente accompagnement",
      description: `Le service ${env.REACT_APP_SERVICE} est en train de mettre en place l'accompagnement associé à votre demande.`,
      icone: <HourglassOutlined aria-hidden />,
      ordre: 45,
      color: "orange",
      hexColor: "#d46b08",
      conformite: true,
      gestionnairePeutModifier: true,
      afficherMessageSuiviEmail: true,
      afficherDerniereModif: false,
      etapeIndex: 4,
   },

   {
      id: ETAT_DEMANDE_VALIDEE,
      etape: "D",
      // libelle: "Accompagnement accepté",
      description:
         "{Article} demande a été acceptée, des instructions {contexte}ont été transmises par email.",
      icone: <CheckCircleOutlined aria-hidden />,
      ordre: 50,
      color: "green",
      hexColor: "#389e0d",
      conformite: true,
      gestionnairePeutModifier: false,
      afficherMessageSuiviEmail: false,
      afficherDerniereModif: false,
      etapeIndex: 4,
   },
   {
      id: ETAT_DEMANDE_REFUSEE,
      etape: "D",
      // libelle: "Accompagnement refusé",
      description:
         "{Article} demande a été refusée, un email contenant plus d'informations {contexte}a été adressé.",
      icone: <CloseCircleOutlined aria-hidden />,
      ordre: 51,
      color: "red",
      hexColor: "#cf1322",
      conformite: false,
      gestionnairePeutModifier: false,
      afficherMessageSuiviEmail: false,
      afficherDerniereModif: true,
      etapeIndex: 4,
   },
];

export type EtatDemande =
   | typeof ETAT_DEMANDE_EN_COURS
   | typeof ETAT_DEMANDE_RECEPTIONNEE
   | typeof ETAT_DEMANDE_CONFORME
   | typeof ETAT_DEMANDE_VALIDEE
   | typeof ETAT_DEMANDE_REFUSEE
   | typeof ETAT_DEMANDE_PROFIL_ACCEPTE
   | typeof ETAT_DEMANDE_ATTENTE_COMMISSION
   | typeof ETAT_DEMANDE_NON_CONFORME
   | typeof ETAT_ATTENTE_CHARTES;

export function getEtatDemandeInfo(etat: string) {
   return ETATS_DEMANDES.find((e) => e.id === etat);
}

export function getEtatDemandeIndex(etat: string) {
   return ETATS_DEMANDES.findIndex((e) => e.id === etat);
}

export function getEtatDemandeOrdre(etat: string) {
   return ETATS_DEMANDES.find((e) => e.id === etat)?.ordre || 0;
}

export function getEtatDemande(etat: string) {
   return ETATS_DEMANDES.find((e) => e.id === etat);
}

interface IEtatDescriptionProps {
   demande: IDemande;
   avecCommission?: boolean;
}

export function EtatDescription({ demande }: IEtatDescriptionProps) {
   const article = "Votre";
   const navigate = useNavigate();
   let description = ETATS_DEMANDES.find((e) => e.id === demande.etat)?.description;

   if (!description) return null;
   description = description
      .replaceAll("{article}", article.toLocaleLowerCase())
      .replaceAll("{Article}", article.charAt(0).toUpperCase() + article.slice(1))
      .replaceAll("{service}", env.REACT_APP_SERVICE || "")
      .replaceAll("{contexte}", "vous ");

   switch (demande.etat) {
      case ETAT_DEMANDE_EN_COURS:
         return (
            <Space orientation="vertical">
               <span>{description}.</span>
               <Button
                  className="mt-2"
                  type="primary"
                  onClick={() => navigate(`/demandes/${demande.id}/saisie`)}
               >
                  Reprendre la saisie
               </Button>
            </Space>
         );
      case ETAT_DEMANDE_RECEPTIONNEE:
      case ETAT_DEMANDE_CONFORME:
      case ETAT_DEMANDE_VALIDEE:
      case ETAT_DEMANDE_REFUSEE:
      case ETAT_DEMANDE_ATTENTE_COMMISSION:
      case ETAT_ATTENTE_CHARTES:
      case ETAT_ATTENTE_ACCOMPAGNEMENT:
         return description;
   }
}

export function getTypeDemandeDescription(typeDemande: ITypeDemande) {
   if (typeDemande.campagneEnCours)
      return (
         <CampagneDemandeDateItem
            campagneDemandeId={typeDemande.campagneEnCours}
            templateString="Campagne ouverte du {{debut}} au {{fin}}."
         />
      );

   if (typeDemande.campagneSuivante) {
      return (
         <CampagneDemandeDateItem
            campagneDemandeId={typeDemande.campagneSuivante}
            templateString="Campagne fermée. Prochaine campagne du {{debut}} au {{fin}}."
         />
      );
   }

   if (typeDemande.campagnePrecedente) {
      return (
         <CampagneDemandeDateItem
            campagneDemandeId={typeDemande.campagnePrecedente}
            templateString="Campagne fermée depuis le {{fin}}."
         />
      );
   }

   return "Aucune campagne ouverte.";
}
