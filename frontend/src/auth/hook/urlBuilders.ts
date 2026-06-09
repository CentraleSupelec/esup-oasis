/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { objectToQuery, queryToObject } from "@utils/url";

type ResponseType = "code" | "token";
type ExtraQueryParameters = Record<string, string | number | boolean> | undefined;

export const enhanceAuthorizeUrl = (
  authorizeUrl: string,
  clientId: string,
  redirectUri: string,
  scope: string,
  state: string,
  nonce: string,
  responseType: ResponseType,
  extraQueryParameters: ExtraQueryParameters,
): string => {
  const queryObj: Record<string, string | number | boolean | undefined> = {
    response_type: responseType,
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    nonce,
    ...extraQueryParameters,
  };

  const cleanQueryObj: Record<string, string> = {};
  Object.entries(queryObj).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanQueryObj[key] = value.toString();
    }
  });

  return `${authorizeUrl}?${objectToQuery(cleanQueryObj)}`;
};

export const formatExchangeCodeForTokenServerURL = (
  exchangeCodeForTokenServerURL: string,
  clientId: string,
  code: string,
  redirectUri: string,
  state: string,
): string => {
  const queryIndex = exchangeCodeForTokenServerURL.indexOf("?");
  const url =
    queryIndex === -1
      ? exchangeCodeForTokenServerURL
      : exchangeCodeForTokenServerURL.slice(0, queryIndex);
  const anySearchParameters =
    queryIndex === -1 ? {} : queryToObject(exchangeCodeForTokenServerURL.slice(queryIndex + 1));

  return `${url}?${objectToQuery({
    ...anySearchParameters,
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    state,
  })}`;
};
