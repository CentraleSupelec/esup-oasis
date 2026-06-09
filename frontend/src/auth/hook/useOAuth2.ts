/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
  OAUTH_CALLBACK_PAYLOAD_KEY,
} from "@/auth/hook/constants";
import {
  generateNonce,
  generateState,
  getNonce,
  removeNonce,
  removeState,
  saveNonce,
  saveState,
} from "@/auth/hook/state";
import { enhanceAuthorizeUrl, formatExchangeCodeForTokenServerURL } from "@/auth/hook/urlBuilders";

export type AuthTokenPayload = {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token: string;
};

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

export type Oauth2Props<TData = AuthTokenPayload> = {
  authorizeUrl: string;
  clientId: string;
  redirectUri: string;
  clientUri: string;
  scope?: string;

  extraQueryParameters?: Record<string, string | number | boolean>;
  onError?: (error: string) => void;
} & ResponseTypeBasedProps<TData>;

/**
 * Hook `useOAuth2` — flow redirect (sans popup).
 *
 * - `getAuth()` redirige la fenêtre principale vers le provider OAuth.
 *   Un `state` (CSRF) et un `nonce` (replay) sont générés en sessionStorage.
 * - Au retour (après `/callback`), `OAuthCallback` valide le state, stocke le payload
 *   en sessionStorage et redirige vers la racine.
 * - Un `useEffect` au montage lit ce payload, vérifie le nonce si le serveur l'a
 *   inclus dans la réponse (OIDC), puis appelle `onSuccess`/`onError`.
 *
 * Note : pour les providers OAuth2 pur (non OIDC), le nonce est envoyé mais ne peut
 * pas être vérifié côté client (il n'est pas inclus dans l'access_token). La vérification
 * est assurée côté serveur si le provider supporte OIDC.
 */
const useOAuth2 = <TData = AuthTokenPayload>(props: Oauth2Props<TData>) => {
  const {
    authorizeUrl,
    clientId,
    redirectUri,
    scope = "",
    responseType,
    extraQueryParameters = {},
    onSuccess,
    onError,
  } = props;

  const extraQueryParametersRef = useRef(extraQueryParameters);
  const [{ loading, error }, setUI] = useState<{ loading: boolean; error: string | null }>({
    loading: false,
    error: null,
  });

  const exchangeCodeForTokenServerURL =
    responseType === "code" && props.exchangeCodeForTokenServerURL;
  const exchangeCodeForTokenMethod = responseType === "code" && props.exchangeCodeForTokenMethod;

  // Refs stables pour les callbacks (évite de les mettre en dépendances du useEffect de montage)
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Au montage, traiter le payload laissé par OAuthCallback après le redirect
  useEffect(() => {
    const stored = sessionStorage.getItem(OAUTH_CALLBACK_PAYLOAD_KEY);
    if (!stored) return;

    sessionStorage.removeItem(OAUTH_CALLBACK_PAYLOAD_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUI({ loading: true, error: null });

    void (async () => {
      try {
        const message: { error?: string; payload?: Record<string, string> } = JSON.parse(stored);

        if (message.error) {
          setUI({ loading: false, error: message.error });
          onErrorRef.current?.(message.error);
          return;
        }

        // Vérification du nonce si le serveur l'a inclus dans la réponse (providers OIDC)
        const storedNonce = getNonce();
        if (storedNonce && message.payload?.nonce && message.payload.nonce !== storedNonce) {
          setUI({ loading: false, error: "OAuth error: Nonce mismatch." });
          onErrorRef.current?.("OAuth error: Nonce mismatch.");
          return;
        }

        let payload: TData | Record<string, string> | undefined = message.payload;

        if (responseType === "code" && exchangeCodeForTokenServerURL) {
          const state = message.payload?.state ?? "";
          const response = await fetch(
            formatExchangeCodeForTokenServerURL(
              exchangeCodeForTokenServerURL,
              clientId,
              message.payload?.code ?? "",
              redirectUri,
              state,
            ),
            {
              method: exchangeCodeForTokenMethod || DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
            },
          );
          payload = await response.json();
        }

        setUI({ loading: false, error: null });
        onSuccessRef.current?.(payload as TData);
      } catch (err: unknown) {
        setUI({
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        removeState();
        removeNonce();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionnellement vide : s'exécute uniquement au montage

  const getAuth = useCallback(() => {
    setUI({ loading: true, error: null });

    const state = generateState();
    saveState(state);

    const nonce = generateNonce();
    saveNonce(nonce);

    window.location.href = enhanceAuthorizeUrl(
      authorizeUrl,
      clientId,
      redirectUri,
      scope,
      state,
      nonce,
      responseType,
      extraQueryParametersRef.current,
    );
  }, [authorizeUrl, clientId, redirectUri, scope, responseType]);

  return { loading, error, getAuth };
};

export default useOAuth2;
