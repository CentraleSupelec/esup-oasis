/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { POPUP_HEIGHT, POPUP_WIDTH } from "./constants";
import React from "react";

//--- Gestion du popup d'auth : ouverture et fermeture

export const openAuthPopup = (url: string) => {
   // To fix issues with window.screen in multi-monitor setups, the easier option is to
   // center the pop-up over the parent window.
   const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
   const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
   return window.open(
      url,
      "OAuth2 Popup",
      `height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`,
   );
};
export const closeAuthPopup = (popupRef: React.RefObject<Window | null | undefined>) => {
   popupRef.current?.close();
};
