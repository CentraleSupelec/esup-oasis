/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import { IAccessibilite } from "./redux/context/IAccessibilite";
import { useSelector } from "react-redux";
import { IStore } from "./redux/Store";
import { ConfigProvider } from "antd";
import frFR from "antd/lib/locale/fr_FR";
import {
   APP_ERROR_COLOR,
   APP_SUCCESS_COLOR,
   APP_WARNING_COLOR,
   APP_PRIMARY_COLOR,
   APP_PRIMARY_CONTRAST_COLOR,
   APP_PRIMARY_LIGHT_COLOR,
   APP_ERROR_LIGHT_COLOR,
   APP_WARNING_LIGHT_COLOR,
   APP_SUCCESS_LIGHT_COLOR,
   APP_SECONDARY_COLOR,
   APP_SECONDARY_LIGHT_COLOR,
   APP_SECONDARY_CONTRAST_COLOR,
} from "./constants";
import { pSBC } from "./utils/colors";

function getColorVariant(color: string | null, fallbackColor: string, fallbackCoef: number) {
   return color || (pSBC(fallbackCoef, fallbackColor) as string);
}

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
   const appAccessibilite: IAccessibilite = useSelector(
      ({ accessibilite }: Partial<IStore>) => accessibilite,
   ) as IAccessibilite;

   // Ajoute les couleurs de l'application aux variables CSS
   useEffect(() => {
      document.documentElement.style.setProperty(
         "--color-primary",
         appAccessibilite.contrast
            ? getColorVariant(APP_PRIMARY_CONTRAST_COLOR, APP_PRIMARY_COLOR, -0.5)
            : APP_PRIMARY_COLOR,
      );
      document.documentElement.style.setProperty(
         "--color-primary-contrast",
         getColorVariant(APP_PRIMARY_CONTRAST_COLOR, APP_PRIMARY_COLOR, -0.5),
      );
      document.documentElement.style.setProperty(
         "--color-primary-light",
         getColorVariant(APP_PRIMARY_LIGHT_COLOR, APP_PRIMARY_COLOR, 0.8),
      );

      document.documentElement.style.setProperty(
         "--color-app",
         appAccessibilite.contrast
            ? getColorVariant(APP_SECONDARY_CONTRAST_COLOR, APP_SECONDARY_COLOR, -0.25)
            : APP_SECONDARY_COLOR,
      );
      document.documentElement.style.setProperty(
         "--color-app-light",
         appAccessibilite.contrast
            ? "var(--color-app)"
            : getColorVariant(APP_SECONDARY_LIGHT_COLOR, APP_SECONDARY_COLOR, 0.8),
      );
      document.documentElement.style.setProperty(
         "--color-app-contrast",
         getColorVariant(APP_SECONDARY_CONTRAST_COLOR, APP_SECONDARY_COLOR, -0.5),
      );

      document.documentElement.style.setProperty("--color-error", APP_ERROR_COLOR);
      document.documentElement.style.setProperty(
         "--color-error-light",
         getColorVariant(APP_ERROR_LIGHT_COLOR, APP_ERROR_COLOR, 0.8),
      );
      document.documentElement.style.setProperty("--color-warning", APP_WARNING_COLOR);
      document.documentElement.style.setProperty(
         "--color-warning-light",
         getColorVariant(APP_WARNING_LIGHT_COLOR, APP_WARNING_COLOR, 0.8),
      );
      document.documentElement.style.setProperty("--color-success", APP_SUCCESS_COLOR);
      document.documentElement.style.setProperty(
         "--color-success-light",
         getColorVariant(APP_SUCCESS_LIGHT_COLOR, APP_SUCCESS_COLOR, 0.8),
      );
   }, [appAccessibilite.contrast]);

   function getFontSize() {
      if (appAccessibilite.policeLarge) {
         return 20;
      }
      if (appAccessibilite.dyslexieArial || appAccessibilite.dyslexieOpenDys) {
         return 17;
      }
      return 16;
   }

   function getFontFamily() {
      if (appAccessibilite.dyslexieLexend) {
         return "Lexend, sans-serif";
      }
      if (appAccessibilite.dyslexieArial) {
         return "Arial, Helvetica, sans-serif";
      }
      if (appAccessibilite.dyslexieOpenDys) {
         return "OpenDys, Arial, Helvetica, sans-serif";
      }
      return "NoirPro, sans-serif";
   }

   function getFontWeight() {
        if (appAccessibilite.dyslexieArial || appAccessibilite.dyslexieOpenDys || appAccessibilite.dyslexieLexend) {
             return undefined;
        }
        return 500;
   }

   return (
      <ConfigProvider
         locale={frFR}
         theme={{
            token: {
               colorPrimary: appAccessibilite.contrast
                  ? getColorVariant(APP_PRIMARY_CONTRAST_COLOR, APP_PRIMARY_COLOR, -0.5)
                  : APP_PRIMARY_COLOR,
               colorInfo: appAccessibilite.contrast
                  ? getColorVariant(APP_PRIMARY_CONTRAST_COLOR, APP_PRIMARY_COLOR, -0.5)
                  : APP_PRIMARY_COLOR,
               colorError: APP_ERROR_COLOR,
               colorSuccess: APP_SUCCESS_COLOR,
               colorWarning: APP_WARNING_COLOR,
               colorText: appAccessibilite.contrast ? "#000000" : "#333333",
               colorTextDisabled: appAccessibilite.contrast ? "#333" : "#555",
               fontSize: getFontSize(),
               fontWeightStrong: getFontWeight(),
               wireframe: false,
               fontFamily: getFontFamily(),
               //fontWeightStrong: 500,
               borderRadius: 7,
               opacityLoading: 0.75,
               linkDecoration:
                  appAccessibilite.dyslexieArial || appAccessibilite.dyslexieOpenDys
                     ? "underline"
                     : "none",
            },
         }}
      >
         {children}
      </ConfigProvider>
   );
}
