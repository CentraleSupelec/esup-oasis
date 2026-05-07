/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { RoleValues } from "../lib/Utilisateur";
import { IRoute } from "./ProdRouter";
import Parametres from "./administration/Parametres/Parametres";
import ServicesFaits from "./administration/Bilans/ServicesFaits/ServicesFaits";
import BilanFinancier from "./administration/Bilans/BilanFinancier/BilanFinancier";
import Utilisateurs from "./administration/Utilisateurs/Utilisateurs";
import { Amenagements as AmenagementsAdmin } from "./administration/Referentiel/Amenagements/Amenagements";
import ClubsSportifs from "./administration/Referentiel/ClubsSportifs/ClubsSportifs";
import Chartes from "./administration/Referentiel/Chartes/Chartes";
import PeriodesRh from "./administration/Referentiel/PeriodeRh/PeriodesRh";
import TypesEvenements from "./administration/Referentiel/TypeEvenement/TypesEvenements";
import Profils from "./administration/Referentiel/Profils/Profils";
import Referentiel from "./administration/Referentiel/Referentiel";
import TypesDemandes from "./administration/TypesDemandes/TypesDemandes";
import Commissions from "./administration/Commissions/Commissions";
import Administration from "./administration/Administration";
import ValidationInterventionsRenforts from "./gestionnaire/interventions/ValidationInterventionsRenforts";
import BilanBeneficiaireIntervenant
   from "./administration/Bilans/BeneficiairesIntervenants/BilanBeneficiaireIntervenant";
import Beneficiaire from "./gestionnaire/beneficiaires/Beneficiaire";
import Bilans from "./administration/Bilans/Bilans";
import Demande from "./gestionnaire/demandeurs/Demande";
import Demandeurs from "./gestionnaire/demandeurs/Demandeurs";
import Beneficiaires from "./gestionnaire/beneficiaires/Beneficiaires";
import Amenagements from "./gestionnaire/beneficiaires/Amenagements";
import Intervenants from "./gestionnaire/intervenants/Intervenants";
import InterventionsForfait from "./gestionnaire/interventions/InterventionsForfait";
import MesInterventions from "../controls/Interventions/MesInterventions";
import Demandes from "./demandeur/Demandes";
import TypeDemandeSoumise from "../controls/Questionnaire/TypeDemandeSoumise";
import DemandeAvancement from "./demandeur/DemandeAvancement";
import DemandeSaisie from "./demandeur/DemandeSaisie";
import Version from "./commun/Version";
import PlanningWithSider from "../controls/Calendar/PlanningWithSider";
import PlanningTable from "../controls/Calendar/PlanningTable";
import CategoriesTags from "./administration/Referentiel/Tags/CategoriesTags";
import MonProfil from "./commun/MonProfil";
import AlertCompleterProfil from "../controls/Dashboard/AlertCompleterProfil";
import PlanningCalendar from "../controls/Calendar/PlanningCalendar";
import { IntervenantDashboard as DashboardIntervenant } from "./intervenant/dashboard/IntervenantDashboard";
import { GestionnaireDashboard as DashboardGestionnaire } from "./gestionnaire/dashboard/GestionnaireDashboard";
import { ServicesFaits as MesServicesFaits } from "./intervenant/ServicesFaits/ServicesFaits";
import Demandeur from "./gestionnaire/demandeurs/Demandeur";
import SportifsHautNiveau from "./administration/Referentiel/SportifsHautNiveau/SportifsHautNiveau";
import Referents from "./administration/Referentiel/Referents/Referents";
import BilanActivites from "./administration/Bilans/BilanActivites/BilanActivites";
import EvenementsSansBeneficiaires from "./gestionnaire/interventions/EvenementsSansBeneficiaires";

// noinspection DuplicatedCode
/**
 * Represents the routes configuration for the application
 * and the roles required to access them.
 *
 * @type {IRoute[]}
 */
export const DEV_ROUTES: IRoute[] = [
   // --- Admin ---
   {
      path: "/administration/referentiels/parametres",
      element: <Parametres />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/bilans/services-faits",
      element: <ServicesFaits />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/bilans/financier",
      element: <BilanFinancier />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/bilans/activites",
      element: <BilanActivites />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/utilisateurs",
      element: <Utilisateurs />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/sportifs-haut-niveau",
      element: <SportifsHautNiveau />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types-amenagements",
      element: <AmenagementsAdmin />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/clubs-sportifs",
      element: <ClubsSportifs />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/referents",
      element: <Referents />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/chartes",
      element: <Chartes />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/periodes-rh",
      element: <PeriodesRh />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types-evenements",
      element: <TypesEvenements />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/profils",
      element: <Profils />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/tags",
      element: <CategoriesTags />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types_demandes",
      element: <TypesDemandes />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types_demandes",
      element: <TypesDemandes />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/commissions/:id",
      element: <Commissions />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/commissions",
      element: <Commissions />,
      roles: [RoleValues.ROLE_ADMIN],
   },

   {
      path: "/administration/referentiels/:referentielId",
      element: <Referentiel />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration",
      element: <Administration />,
      roles: [RoleValues.ROLE_ADMIN],
   },
   // --- Gestionnaire / Chargé d'accompagnement ---
   {
      path: "/interventions/renforts",
      element: <ValidationInterventionsRenforts />,
      roles: [RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/bilans/intervenants",
      element: <BilanBeneficiaireIntervenant type="intervenant" />,
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/bilans/beneficiaires",
      element: <BilanBeneficiaireIntervenant type="bénéficiaire" />,
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/beneficiaires/:id",
      element: <Beneficiaire />,
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/bilans",
      element: <Bilans />,
      roles: [RoleValues.ROLE_GESTIONNAIRE],
   },
   // --- Gestionnaire / Planificateur ---
   {
      path: "/demandes/:id",
      element: <Demande />,
      roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/demandeurs/:id",
      element: <Demandeur />,
      roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/demandes/:id/saisie",
      element: <Demande />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/demandeurs",
      element: <Demandeurs />,
      roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/beneficiaires",
      element: <Beneficiaires />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/amenagements",
      element: <Amenagements />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/intervenants",
      element: <Intervenants />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/interventions/forfait",
      element: <InterventionsForfait />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/mes-interventions",
      element: <MesInterventions />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/dashboard",
      element: <DashboardGestionnaire />,
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   // --- Membres de commision ---
   {
      path: "/dashboard",
      element: <Demandeurs />,
      roles: [RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/demandes",
      element: <Demandeurs />,
      roles: [RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   // --- Référents ---
   {
      path: "/amenagements",
      element: <Amenagements />,
      roles: [RoleValues.ROLE_REFERENT_COMPOSANTE],
   },
   {
      path: "/dashboard",
      element: <Amenagements />,
      roles: [RoleValues.ROLE_REFERENT_COMPOSANTE],
   },
   // --- Intervenants & bénéficiaires ---
   {
      path: "/profil",
      element: <MonProfil />,
      roles: [RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   // --- Intervenants ---
   {
      path: "/dashboard",
      element: <DashboardIntervenant />,
      roles: [RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/services-faits",
      element: <MesServicesFaits />,
      roles: [RoleValues.ROLE_INTERVENANT, RoleValues.ROLE_RENFORT],
   },
   // --- Bénéficiaires ---
   {
      path: "/dashboard",
      element: (
         <>
            <div className="p-2">
               <AlertCompleterProfil />
            </div>
            <PlanningWithSider />
         </>
      ),
      roles: [RoleValues.ROLE_BENEFICIAIRE],
   },
   // --- Tous les utilisateurs disposant d'un rôle en rapport avec planification ---
   {
      path: "/planning/calendrier",
      element: <PlanningCalendar />,
      roles: [
         RoleValues.ROLE_ADMIN,
         RoleValues.ROLE_PLANIFICATEUR,
         RoleValues.ROLE_BENEFICIAIRE,
         RoleValues.ROLE_INTERVENANT,
      ],
   },
   {
      path: "/planning/liste-evenements",
      element: <PlanningTable />,
      roles: [
         RoleValues.ROLE_ADMIN,
         RoleValues.ROLE_PLANIFICATEUR,
         RoleValues.ROLE_BENEFICIAIRE,
         RoleValues.ROLE_INTERVENANT,
      ],
   },
   {
      path: "/planning/evenements-sans-beneficiaires",
      element: <EvenementsSansBeneficiaires />,
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/planning",
      element: <PlanningWithSider />,
      roles: [
         RoleValues.ROLE_ADMIN,
         RoleValues.ROLE_PLANIFICATEUR,
         RoleValues.ROLE_BENEFICIAIRE,
         RoleValues.ROLE_INTERVENANT,
      ],
   },
   // --- Tous les utilisateurs ---
   {
      path: "/versions",
      element: <Version />,
      roles: null,
   },
   // --- Demandes ---
   {
      path: "/demandes/:id/saisie",
      element: <DemandeSaisie />,
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/demandes/:id",
      element: <DemandeAvancement />,
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/demandes",
      element: <Demandes />,
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/dashboard",
      element: <Demandes />,
      roles: [RoleValues.ROLE_DEMANDEUR],
   },
   {
      path: "/demande-soumise",
      element: <TypeDemandeSoumise />,
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
];
