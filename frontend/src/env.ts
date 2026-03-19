/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

type EnvType = {
   // Variables liées à l'établissement et au service d'accompagnement des étudiants
   REACT_APP_TITRE: string;
   REACT_APP_ETABLISSEMENT: string;
   REACT_APP_ETABLISSEMENT_ARTICLE: string;
   REACT_APP_ETABLISSEMENT_ABV: string;
   REACT_APP_ETABLISSEMENT_ABV_ARTICLE: string;
   REACT_APP_ETABLISSEMENT_URL: string | null;
   REACT_APP_SERVICE: string;
   REACT_APP_EMAIL_SERVICE: string;
   REACT_APP_URL_SERVICE: string | null;
   REACT_APP_ESPACE_SANTE: string | null;
   REACT_APP_ESPACE_SANTE_ABV: string | null;
   REACT_APP_ADRESSE_DPD: string | null;
   REACT_APP_EMAIL_DPD: string | null;
   REACT_APP_INFOS_AUTH: string | null;
   REACT_APP_LOGO: string | null;

   // Variables pour l'affichage des photos des étudiants
   REACT_APP_PHOTO: string | null;
   REACT_APP_PHOTO_DEMO: string | null;

   // Variables pour le service de synchronisation des événements
   REACT_APP_NOM_SERVICE_SYNCHRO: string | null;
   REACT_APP_URL_SERVICE_SYNCHRO: string | null;
   REACT_APP_GUIDE_SERVICE_SYNCHRO: string | null;

   // Variable pour la version de l'application
   REACT_APP_VERSION: string;

   // Autres variables de l'application
   REACT_APP_VISITE_GUIDEE: string | null;
   REACT_APP_MSG_ACCUEIL: string | null;

   // Variables liées aux couleurs de l'application
   REACT_APP_PRIMARY_COLOR: string;
   REACT_APP_PRIMARY_CONTRAST_COLOR: string | null;
   REACT_APP_PRIMARY_LIGHT_COLOR: string | null;
   REACT_APP_SECONDARY_COLOR: string | null;
   REACT_APP_SECONDARY_LIGHT_COLOR: string | null;
   REACT_APP_SECONDARY_CONTRAST_COLOR: string | null;
   REACT_APP_ERROR_COLOR: string | null;
   REACT_APP_ERROR_LIGHT_COLOR: string | null;
   REACT_APP_WARNING_COLOR: string | null;
   REACT_APP_WARNING_LIGHT_COLOR: string | null;
   REACT_APP_SUCCESS_COLOR: string | null;
   REACT_APP_SUCCESS_LIGHT_COLOR: string | null;

   // Variables liées à l'environnement d'exécution
   REACT_APP_API: string;
   REACT_APP_API_PREFIX: string;
   REACT_APP_OAUTH_PROVIDER: string;
   REACT_APP_OAUTH_CLIENT_ID: string;
   REACT_APP_FRONTEND: string;
   REACT_APP_ENVIRONMENT: string;
};

declare global {
   interface Window {
      env: EnvType;
   }
}

export const env: EnvType = { ...{ REACT_APP_API_PREFIX: "" }, ...process.env, ...window.env };
