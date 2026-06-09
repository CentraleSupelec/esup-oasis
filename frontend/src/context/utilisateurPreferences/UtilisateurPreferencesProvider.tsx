/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { useTheme } from "@context/theme/ThemeContext";
import { QK_UTILISATEURS_PARAMETRES_UI } from "@api";
import { logger } from "@utils/logger";

export interface UtilisateurPreferencesType {
  getPreference: (cle: string) => string | undefined;
  getPreferenceJson: (cle: string) => object | undefined;
  getPreferenceArray: (cle: string) => any[];
  setPreference: (cle: string, value: string) => void;
  setPreferenceJson: (cle: string, value: object) => void;
  setPreferenceArray: (cle: string, value: any[]) => void;
  preferencesChargees: boolean;
}

const UtilisateurPreferencesContext = createContext<UtilisateurPreferencesType>(null!);

export function UtilisateurPreferencesProvider(props: { children: ReactNode }) {
  const auth = useAuth();
  const { setContrast, setDyslexieArial, setDyslexieOpenDys, setDyslexieLexend, setPoliceLarge } =
    useAccessibilite();
  const { setThemeMode } = useTheme();
  const { data: preferences } = useApi().useGetFullCollection({
    path: "/utilisateurs/{uid}/parametres_ui",
    parameters: { uid: auth.user?.["@id"] as string },
    enabled: !!auth.user,
    onError: (error) => {
      logger.error(error);
    },
  });
  const preferencesChargees = preferences !== undefined;

  const mutatePreference = useApi().usePut({
    path: "/utilisateurs/{uid}/parametres_ui/{cle}",
    invalidationQueryKeys: [QK_UTILISATEURS_PARAMETRES_UI],
  });
  const { mutate: mutatePreferenceRaw } = mutatePreference;

  // Accessibilité
  useEffect(() => {
    if (preferences) {
      // Rétablissement du thème en premier (nécessaire pour valider le contraste ensuite)
      const themeMode = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/theme-mode`,
      );
      const restoredThemeMode = ["light", "dark", "system"].includes(themeMode?.valeur ?? "")
        ? (themeMode!.valeur as "light" | "dark" | "system")
        : "system";
      if (themeMode) setThemeMode(restoredThemeMode);

      const contrast = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/contrast`,
      );
      if (contrast) setContrast(contrast.valeur === "true");

      const dyslexieArial = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/dyslexie-arial`,
      );
      if (dyslexieArial) setDyslexieArial(dyslexieArial?.valeur === "true");

      const dyslexieOpenDys = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/dyslexie-opendys`,
      );
      if (dyslexieOpenDys) setDyslexieOpenDys(dyslexieOpenDys?.valeur === "true");

      const dyslexieLexend = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/dyslexie-lexend`,
      );
      if (dyslexieLexend) setDyslexieLexend(dyslexieLexend?.valeur === "true");

      const policeLarge = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/police-large`,
      );
      if (policeLarge) setPoliceLarge(policeLarge?.valeur === "true");
    }
  }, [
    auth.user,
    preferences,
    setContrast,
    setDyslexieArial,
    setDyslexieOpenDys,
    setDyslexieLexend,
    setPoliceLarge,
    setThemeMode,
  ]);

  const getPreference = useCallback(
    (cle: string) =>
      preferences?.items.find((p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/${cle}`)
        ?.valeur,

    [preferences, auth.user],
  );

  const getPreferenceJson = useCallback(
    (cle: string): object => {
      try {
        return JSON.parse(getPreference(cle) || "{}");
      } catch {
        return {};
      }
    },
    [getPreference],
  );

  const getPreferenceArray = useCallback(
    (cle: string): any[] => {
      try {
        return JSON.parse(getPreference(cle) || "[]");
      } catch {
        return [];
      }
    },
    [getPreference],
  );

  const setPreference = useCallback(
    (cle: string, value: string) => {
      mutatePreferenceRaw({
        "@id": `${auth.user?.["@id"]}/parametres_ui/${cle}`,
        data: {
          valeur: value,
        },
      });
    },
    // mutatePreferenceRaw est stable (garanti par React Query)
    [mutatePreferenceRaw, auth.user],
  );

  const setPreferenceJson = useCallback(
    (cle: string, value: object) => {
      setPreference(cle, JSON.stringify(value));
    },
    [setPreference],
  );

  const setPreferenceArray = useCallback(
    (cle: string, value: any[]) => {
      setPreference(cle, JSON.stringify(value));
    },
    [setPreference],
  );

  const contextValue = useMemo(
    () => ({
      getPreference,
      getPreferenceJson,
      getPreferenceArray,
      setPreference,
      setPreferenceJson,
      setPreferenceArray,
      preferencesChargees,
    }),
    [
      getPreference,
      getPreferenceJson,
      getPreferenceArray,
      setPreference,
      setPreferenceJson,
      setPreferenceArray,
      preferencesChargees,
    ],
  );

  return (
    <UtilisateurPreferencesContext.Provider value={contextValue}>
      {props.children}
    </UtilisateurPreferencesContext.Provider>
  );
}

export function usePreferences(): UtilisateurPreferencesType {
  const ctx = useContext(UtilisateurPreferencesContext);
  if (ctx === null)
    throw new Error("usePreferences doit être utilisé dans un <UtilisateurPreferencesProvider>");
  return ctx;
}
