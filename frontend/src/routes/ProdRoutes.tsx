/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { lazy } from "react";
import { RoleValues } from "../lib/Utilisateur";
import { IRoute } from "./ProdRouter";

// --- Gestionnaire / Planificateur ---
const Beneficiaires = lazy(() => import("./gestionnaire/beneficiaires/Beneficiaires"));
const MesInterventions = lazy(() => import("../controls/Interventions/MesInterventions"));
const ValidationInterventionsRenforts = lazy(
   () => import("./gestionnaire/interventions/ValidationInterventionsRenforts"),
);
const Intervenants = lazy(() => import("./gestionnaire/intervenants/Intervenants"));
const DashboardGestionnaire = lazy(() => import("./gestionnaire/dashboard/GestionnaireDashboard"));
const InterventionsForfait = lazy(
   () => import("./gestionnaire/interventions/InterventionsForfait"),
);
const AlertCompleterProfil = lazy(() => import("../controls/Dashboard/AlertCompleterProfil"));
const DashboardIntervenant = lazy(() => import("./intervenant/dashboard/IntervenantDashboard"));

const Beneficiaire = lazy(() => import("./gestionnaire/beneficiaires/Beneficiaire"));
const Amenagements = lazy(() => import("./gestionnaire/beneficiaires/Amenagements"));
const Demande = lazy(() => import("./gestionnaire/demandeurs/Demande"));
const Demandeurs = lazy(() => import("./gestionnaire/demandeurs/Demandeurs"));

// --- Intervenant et bénéficiaire ---
const MonProfil = lazy(() => import("./commun/MonProfil"));
const MesServicesFaits = lazy(() => import("./intervenant/ServicesFaits/ServicesFaits"));

// --- Demandeur ---
const DemandeSaisie = lazy(() => import("./demandeur/DemandeSaisie"));
const DemandeAvancement = lazy(() => import("./demandeur/DemandeAvancement"));
const Demandes = lazy(() => import("./demandeur/Demandes"));
const TypeDemandeSoumise = lazy(() => import("./../controls/Questionnaire/TypeDemandeSoumise"));
const Demandeur = lazy(() => import("./gestionnaire/demandeurs/Demandeur"));

// --- Administration ---
const BilanBeneficiaireIntervenant = lazy(
   () => import("./administration/Bilans/BeneficiairesIntervenants/BilanBeneficiaireIntervenant"),
);
const Utilisateurs = lazy(() => import("./administration/Utilisateurs/Utilisateurs"));
const PeriodesRh = lazy(() => import("./administration/Referentiel/PeriodeRh/PeriodesRh"));
const TypesEvenements = lazy(
   () => import("./administration/Referentiel/TypeEvenement/TypesEvenements"),
);
const Administration = lazy(() => import("./administration/Administration"));
const Profils = lazy(() => import("./administration/Referentiel/Profils/Profils"));
const ServicesFaits = lazy(() => import("./administration/Bilans/ServicesFaits/ServicesFaits"));
const Parametres = lazy(() => import("./administration/Parametres/Parametres"));
const Bilans = lazy(() => import("./administration/Bilans/Bilans"));
const BilanFinancier = lazy(() => import("./administration/Bilans/BilanFinancier/BilanFinancier"));
const BilanActivites = lazy(() => import("./administration/Bilans/BilanActivites/BilanActivites"));
const Referentiel = lazy(() => import("./administration/Referentiel/Referentiel"));
const SportifsHautNiveau = lazy(
   () => import("./administration/Referentiel/SportifsHautNiveau/SportifsHautNiveau"),
);

const AmenagementsAdmin = lazy(
   () => import("./administration/Referentiel/Amenagements/Amenagements"),
);
const ClubsSportifs = lazy(
   () => import("./administration/Referentiel/ClubsSportifs/ClubsSportifs"),
);
const Chartes = lazy(() => import("./administration/Referentiel/Chartes/Chartes"));
const TypesDemandes = lazy(() => import("./administration/TypesDemandes/TypesDemandes"));
const Commissions = lazy(() => import("./administration/Commissions/Commissions"));
const CategoriesTags = lazy(() => import("./administration/Referentiel/Tags/CategoriesTags"));
const Referents = lazy(() => import("./administration/Referentiel/Referents/Referents"));

// --- Commun ---
const PlanningCalendar = lazy(() => import("../controls/Calendar/PlanningCalendar"));
const PlanningTable = lazy(() => import("../controls/Calendar/PlanningTable"));
const PlanningWithSider = lazy(() => import("../controls/Calendar/PlanningWithSider"));
const EvenementsSansBeneficiaires = lazy(
   () => import("./gestionnaire/interventions/EvenementsSansBeneficiaires"),
);

const Version = lazy(() => import("./commun/Version"));

// noinspection DuplicatedCode
/**
 * Represents the routes configuration for the application
 * and the roles required to access them.
 *
 * @type {IRoute[]}
 */
export const LAZY_ROUTES: IRoute[] = [
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
