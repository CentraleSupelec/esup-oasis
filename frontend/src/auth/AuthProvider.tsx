/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { Utilisateur } from "../lib/Utilisateur";
import { message, notification } from "antd";
import useOAuth2 from "./hook/useOAuth2";
import jwt_decode from "jwt-decode";

import { IUtilisateur } from "../api/ApiTypeHelpers";
import { queryClient } from "../App";
import useLocalStorageState from "use-local-storage-state";
import { useNavigate } from "react-router-dom";
import { env } from "../env";

/**
 * Contexte d'authentification.
 *
 * @property {(Utilisateur | undefined)} user - The user object.
 * @property {Function} signOut - The function to sign out the user with a callback.
 * @property {boolean} loading - Indicates if the authentication is currently loading.
 * @property {(string | null)} error - The error message if any occurred during authentication.
 * @property {Function} authenticate - The function to authenticate the user.
 * @property {Function} setUser - The function to set the user object.
 * @property {(string | undefined)} token - The authentication token.
 * @property {(string | undefined)} impersonate - The user to impersonate.
 * @property {Function} setImpersonate - The function to set the user to impersonate.
 * @property {Function} removeImpersonate - The function to remove impersonation.
 */
export interface AuthContextType {
   user: Utilisateur | undefined;
   signOut: (callback: VoidFunction) => void;
   loading: boolean;
   error: string | null;
   authenticate: VoidFunction;
   setUser: (user: Utilisateur) => void;
   token: string | undefined;
   impersonate: string | undefined;
   setImpersonate: (impersonate: string) => void;
   removeImpersonate: VoidFunction;
   isExpired: () => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AuthContext = React.createContext<AuthContextType>(null!);
type State<TData = string> = TData | null;

/**
 * AuthProvider component.
 *
 * @param {React.ReactNode} children - The children to render.
 * @param {VoidFunction} onSuccess - The function to call on successful authentication.
 * @returns {ReactElement} - The component JSX element.
 */
export function AuthProvider({
   children,
   onSuccess,
}: {
   children: React.ReactNode;
   onSuccess: VoidFunction;
}): React.ReactElement {
   const navigate = useNavigate();
   const [user, setUser] = React.useState<IUtilisateur>();
   const [login, setLogin, { removeItem: removeLocalStorageLogin }] =
      useLocalStorageState<State>(`login`);
   const [impersonateLS, setImpersonateLS, { removeItem: removeLocalStorageImpersonate }] =
      useLocalStorageState<State>(`impersonate`);
   const [expiration, setExpiration, { removeItem: removeLocalStorageExpiration }] =
      useLocalStorageState<State<number>>("expiration");

   const [loadingUser, setLoadingUser] = useState(false);
   const [errorUser, setErrorUser] = useState<string | null>(null);
   const [token, setToken] = useState<string>();
   const [impersonate, setImpersonate] = useState<string>();

   // -- Déconnexion
   const signOut = (callback?: VoidFunction) => {
      setToken(undefined);
      setUser(undefined);
      setImpersonate(undefined);
      localStorage.clear();
      removeLocalStorageLogin();
      removeLocalStorageExpiration();
      if (callback) setTimeout(callback, 100);
   };

   // -- Vérification de l'expiration
   const isExpired = (): boolean => {
      if (!expiration) return true;
      return expiration < Date.now();
   };

   // -- Gestion de l'impersonation
   useEffect(() => {
      if (impersonate) {
         setImpersonateLS(impersonate);
      } else {
         removeLocalStorageImpersonate();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [impersonate]);

   // -- Gestion de l'impersonation / local storage
   useEffect(() => {
      if (impersonateLS) {
         setImpersonate(impersonateLS);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // -- Gestion de la connexion : lorsque le login a été récupéré dans le token
   useEffect(() => {
      if (isExpired()) {
         setUser(undefined);
         removeLocalStorageLogin();
         signOut(() => {});
      }

      if (env.REACT_APP_API && (impersonate || login)) {
         setLoadingUser(true);

         // Récupération des infos de l'utilisateur
         fetch(new URL(`/utilisateurs/${impersonate || login}`, env.REACT_APP_API), {
            method: "GET",
            credentials: "include",
            headers: {
               "Content-Type": "application/ld+json",
            },
         })
            .then((userResponse) => {
               userResponse.json().then((userData: IUtilisateur) => {
                  if (userData.roles && userData.roles.length === 1) {
                     // Le seul rôle est ROLE_USER, l'utilisateur n'est pas affecté
                     notification.error({
                        message: "Erreur",
                        description:
                           "Vous ne possédez pas de rôle valide pour vous connecter à l'application.",
                     });
                     setLoadingUser(false);
                     return;
                  }

                  // L'utilisateur est affecté
                  setUser(userData);

                  // redirect apres connexion lorsque l'utilisateur est affecté
                  setTimeout(() => {
                     // console.log("AuthProvider: 154 - redirect to /");
                     //  queryClient.clear();
                     setLoadingUser(false);
                     onSuccess();
                  }, 500);
               });
            })
            .catch((error) => {
               removeLocalStorageLogin();
               setUser(undefined);
               console.error(error);
               setErrorUser(error.message);
               setLoadingUser(false);
            });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [impersonate, login, env.REACT_APP_API]);

   function removeImpersonate() {
      setImpersonate(() => {
         queryClient.clear();
         window.setTimeout(() => {
            navigate("/");
         }, 1000);
         return undefined;
      });
   }

   const { loading, error, getAuth } = useOAuth2({
      authorizeUrl: env.REACT_APP_OAUTH_PROVIDER as string,
      clientId: env.REACT_APP_OAUTH_CLIENT_ID as string,
      redirectUri: `${env.REACT_APP_FRONTEND}/callback`,
      clientUri: env.REACT_APP_FRONTEND as string,
      scope: "profile",
      responseType: "token",
      onSuccess: (payload) => {
         setImpersonate(() => {
            removeLocalStorageLogin();
            return undefined;
         });

         if (!loadingUser && payload && payload.access_token) {
            // Récupération du token d'authentification
            setLoadingUser(true);
            fetch(new URL("/connect/oauth/token?json=1", env.REACT_APP_API), {
               method: "POST",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  accessToken: payload?.access_token,
               }),
            })
               .then((response) => {
                  if (response.status === 401) {
                     // Utilisateur inconnu
                     setErrorUser("Utilisateur inconnu");
                     setLoadingUser(false);
                     notification.error({
                        message: <b>Erreur de connexion</b>,
                        duration: 0,
                        description: (
                           <p aria-label="Vous n'êtes pas autorisé à accéder à cette application">
                              Vous n'êtes pas autorisé•e à accéder à cette application.
                           </p>
                        ),
                     });
                  }

                  // Connexion réussie, récupération du login dans le token
                  response.json().then((apiData) => {
                     if (apiData.token) {
                        // Stockage du token d'authentification pour l'env de dev
                        if (env.REACT_APP_ENVIRONMENT === "local") setToken(apiData.token);

                        // Récupération des infos de l'utilisateur
                        const { username, exp } = jwt_decode<{
                           username: string;
                           exp: number;
                        }>(apiData.token as string);

                        setLogin(username);
                        setExpiration(exp * 1000);
                     }
                  });
               })
               .catch((err) => {
                  setErrorUser("Application non accessible");
                  notification.error({
                     message: <b>Erreur de connexion</b>,
                     duration: 0,
                     description: <p>L'application est actuellement inaccessible.</p>,
                  });
                  setLoadingUser(false);
                  console.error(`Impossible de se connecter au serveur`, err);
               });
         }
      },
      onError: (error_) => console.error("Error", error_),
   });

   // noinspection JSUnusedGlobalSymbols
   const authenticator = {
      user: user ? new Utilisateur(user) : undefined,
      loading: loading || loadingUser,
      error: error || errorUser,
      signOut,
      authenticate: getAuth,
      setUser: setUser,
      token: token,
      impersonate,
      setImpersonate: (uid: string) => {
         if (uid === user?.uid) {
            message.error("Vous ne pouvez pas prendre votre propre identité.").then();
            return;
         }
         setImpersonate(uid);
      },
      removeImpersonate,
      isExpired,
   };

   return <AuthContext.Provider value={authenticator}>{children}</AuthContext.Provider>;
}

export function useAuth() {
   return React.useContext(AuthContext);
}
