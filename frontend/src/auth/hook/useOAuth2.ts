/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useRef, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import { DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD, OAUTH_RESPONSE } from "./constants";
import { objectToQuery, queryToObject } from "../../utils/url";
import { generateState, removeState, saveState, State } from "./state";
import { closeAuthPopup, openAuthPopup } from "./popup";

/**
 * Auth token payload
 */
export type AuthTokenPayload = {
   token_type: string;
   expires_in: number;
   access_token: string;
   scope: string;
   refresh_token: string;
};

/**
 * Response type based props
 */
export type ResponseTypeBasedProps<TData> =
   | {
   responseType: "code";
   exchangeCodeForTokenServerURL: string;
   exchangeCodeForTokenMethod?: "POST" | "GET";
   onSuccess?: (payload: TData) => void;
}
   | {
   responseType: "token";
   onSuccess?: (payload: TData) => void;
}
   | {
   responseType: never;
   onSuccess?: (payload: TData) => void;
};

/**
 * Oauth2 props
 */
export type Oauth2Props<TData = AuthTokenPayload> = {
   authorizeUrl: string;
   clientId: string;
   redirectUri: string;
   clientUri: string;
   scope?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   extraQueryParameters?: Record<string, any>;
   onError?: (error: string) => void;
} & ResponseTypeBasedProps<TData>;

/**
 * Création de l'url d'autorisation
 * @param authorizeUrl
 * @param clientId
 * @param redirectUri
 * @param scope
 * @param state
 * @param responseType
 * @param extraQueryParametersRef
 */
const enhanceAuthorizeUrl = (
   authorizeUrl: string,
   clientId: string,
   redirectUri: string,
   scope: string,
   state: string,
   responseType: Oauth2Props["responseType"],
   extraQueryParametersRef: React.RefObject<Oauth2Props["extraQueryParameters"]>,
) => {
   const query = objectToQuery({
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      ...extraQueryParametersRef.current,
   });

   return `${authorizeUrl}?${query}`;
};

const formatExchangeCodeForTokenServerURL = (
   exchangeCodeForTokenServerURL: string,
   clientId: string,
   code: string,
   redirectUri: string,
   state: string,
) => {
   const queryIndex = exchangeCodeForTokenServerURL.indexOf("?");
   const url =
      queryIndex === -1
         ? exchangeCodeForTokenServerURL
         : exchangeCodeForTokenServerURL.slice(0, queryIndex);
   const anySearchParameters = queryToObject(exchangeCodeForTokenServerURL.slice(queryIndex + 1));

   return `${url}?${objectToQuery({
      ...anySearchParameters,
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      state,
   })}`;
};

/**
 * Hook personnalisé `useOAuth2`pour gérer l'authentification OAuth2 :
 *
 * Ce hook encapsule toute la logique nécessaire pour gérer le processus d'authentification OAuth2,
 * y compris l'ouverture d'une fenêtre popup pour l'authentification, la gestion de l'état, et le traitement des réponses.
 */
const useOAuth2 = <TData = AuthTokenPayload>(props: Oauth2Props<TData>) => {
   const {
      authorizeUrl,
      clientId,
      redirectUri,
      clientUri,
      scope = "",
      responseType,
      extraQueryParameters = {},
      onSuccess,
      onError,
   } = props;

   const extraQueryParametersRef = useRef(extraQueryParameters);
   const popupRef = useRef<Window | null>(null);
   const intervalRef = useRef<any>(null);
   const [{ loading, error }, setUI] = useState({ loading: false, error: null });
   const [data, setData, { removeItem: removeLocalStorage }] =
      useLocalStorageState<State<TData> | null>(
         `${responseType}-${authorizeUrl}-${clientId}-${scope}`,
      );
   const exchangeCodeForTokenServerURL =
      responseType === "code" && props.exchangeCodeForTokenServerURL;
   const exchangeCodeForTokenMethod = responseType === "code" && props.exchangeCodeForTokenMethod;

   const cleanup = (handleMessageListener: any) => {
      clearInterval(intervalRef.current);
      closeAuthPopup(popupRef);
      removeState();
      removeLocalStorage();
      window.removeEventListener("message", handleMessageListener);
   };

   const getAuth = useCallback(() => {
      // 1. Initialisation
      setUI({
         loading: true,
         error: null,
      });

      // 2. Générer un état et le sauvegarder dans le stockage local
      const state = generateState();
      saveState(state);

      // 3. Ouverture de la fenêtre popup
      popupRef.current = openAuthPopup(
         enhanceAuthorizeUrl(
            authorizeUrl,
            clientId,
            redirectUri,
            scope,
            state,
            responseType,
            extraQueryParametersRef,
         ),
      );

      // 4. Gestion de la réponse : écouteur d'événements de message
      async function handleMessageListener(message: MessageEvent<any>) {
         if (!message.origin.includes(clientUri)) throw new Error("Invalid origin");

         const type = message?.data?.type;
         if (type !== OAUTH_RESPONSE) {
            return;
         }
         try {
            const errorMaybe = message?.data?.error;
            if (errorMaybe) {
               setUI({
                  loading: false,
                  error: errorMaybe,
               });
               if (onError) onError(errorMaybe);
            } else {
               let payload = message?.data?.payload;

               if (responseType === "code" && exchangeCodeForTokenServerURL) {
                  const response = await fetch(
                     formatExchangeCodeForTokenServerURL(
                        exchangeCodeForTokenServerURL,
                        clientId,
                        payload?.code,
                        redirectUri,
                        state,
                     ),
                     {
                        method:
                           exchangeCodeForTokenMethod || DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
                     },
                  );
                  payload = await response.json();
               }
               setUI({
                  loading: false,
                  error: null,
               });
               setData(payload);

               if (onSuccess) {
                  onSuccess(payload);
               }
            }
         } catch (genericError: any) {
            console.error(genericError);
            setUI({
               loading: false,
               error: genericError.toString(),
            });
         } finally {
            // Clear stuff ...
            cleanup(handleMessageListener);
         }
      }

      // Ajout d'un écouteur d'événements de message
      window.addEventListener("message", (event) => {
         if (event.origin !== clientUri) {
            throw new Error("Invalid origin for oauth2 response");
         }
         handleMessageListener(event).then();
      });

      // 5. Vérification de la fermeture de la fenêtre popup
      intervalRef.current = setInterval(() => {
         const popupClosed = !popupRef.current?.window || popupRef.current?.window?.closed;
         if (popupClosed) {
            // Popup was closed before completing auth...
            setUI((ui) => ({
               ...ui,
               loading: false,
            }));
            console.warn("Warning: Popup was closed before completing authentication.");
            clearInterval(intervalRef.current);
            removeState();
            window.removeEventListener("message", handleMessageListener);
         }
      }, 250);

      // 0. Nettoyage
      return () => {
         window.removeEventListener("message", handleMessageListener);
         if (intervalRef.current) clearInterval(intervalRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [
      authorizeUrl,
      clientId,
      clientUri,
      redirectUri,
      scope,
      responseType,
      exchangeCodeForTokenServerURL,
      exchangeCodeForTokenMethod,
      onSuccess,
      onError,
      setUI,
      setData,
   ]);

   return { data, loading, error, getAuth };
};

export default useOAuth2;
