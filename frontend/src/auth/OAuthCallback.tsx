/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect } from "react";
import { queryToObject } from "@utils/url";
import "@/auth/OAuthCallback.scss";
import Spinner from "@controls/Spinner/Spinner";
import { OAUTH_CALLBACK_PAYLOAD_KEY, OAUTH_STATE_KEY } from "@/auth/hook/constants";

const checkState = (receivedState: string | null) => {
  const state = sessionStorage.getItem(OAUTH_STATE_KEY);
  return state === receivedState;
};

/**
 * OAuthCallback component
 *
 * Gère les retours OAuth (flow redirect) : lit le hash de l'URL, valide le state,
 * stocke le payload en sessionStorage, puis redirige vers la racine de l'application.
 */
const OAuthCallback = (props: { Component?: ReactElement }): ReactElement => {
  const {
    Component = (
      <div className="oauth-callback">
        <Spinner size={40} />
      </div>
    ),
  } = props;

  useEffect(() => {
    window.setTimeout(() => {
      const payload = queryToObject(window.location.hash.split("#")[1]);
      const state = payload && payload.state;
      const error = payload && payload.error;

      let stored: { error?: string; payload?: Record<string, string> };
      if (error) {
        stored = { error: decodeURI(error) || "OAuth error: An error has occured." };
      } else if (state && checkState(state)) {
        stored = { payload };
      } else {
        stored = { error: "OAuth error: State mismatch." };
      }

      sessionStorage.setItem(OAUTH_CALLBACK_PAYLOAD_KEY, JSON.stringify(stored));
      // replace() évite que /callback reste dans l'historique du navigateur
      window.location.replace(window.location.origin);
    }, 0);
  }, []);

  return Component;
};

export default OAuthCallback;
