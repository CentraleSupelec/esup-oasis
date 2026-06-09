/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { useCallback } from "react";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";

export const PREF_KEY_CONSERVER_FILTRES = "conserverFiltres";

export function useFiltreSessionStorage() {
  const { getPreference, setPreference } = usePreferences();

  const enabled = getPreference(PREF_KEY_CONSERVER_FILTRES) === "true";

  const toggle = useCallback(
    (value: boolean) => {
      setPreference(PREF_KEY_CONSERVER_FILTRES, value ? "true" : "false");
      if (!value) {
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith("oasis:filter:"))
          .forEach((k) => sessionStorage.removeItem(k));
      }
    },
    [setPreference],
  );

  return { enabled, toggle };
}
