/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";
import {
  FiltreAmenagement,
  getFiltreAmenagementDefault,
} from "@controls/Table/AmenagementTableLayout";
import { Utilisateur } from "@lib";
import { ModeAffichageAmenagement } from "@routes/gestionnaire/beneficiaires/Amenagements";

function getSessionKey(mode: ModeAffichageAmenagement): string {
  return mode === ModeAffichageAmenagement.ParAmenagement
    ? "oasis:filter:amenagement"
    : "oasis:filter:amenagement-beneficiaire";
}

function getPrefKey(mode: ModeAffichageAmenagement) {
  return mode === ModeAffichageAmenagement.ParAmenagement
    ? "filtresAmenagement"
    : "filtresAmenagementParBeneficiaire";
}

function readSessionFilter(mode: ModeAffichageAmenagement): FiltreAmenagement | null {
  try {
    const stored = sessionStorage.getItem(getSessionKey(mode));
    return stored ? (JSON.parse(stored) as FiltreAmenagement) : null;
  } catch {
    return null;
  }
}

/**
 * Hook custom pour gérer l'état du filtre d'aménagements
 * Gère le chargement initial via les préférences et la synchronisation lors du changement de mode
 */
export function useAmenagementFilter(
  modeAffichage: ModeAffichageAmenagement,
  sessionEnabled: boolean,
) {
  const auth = useAuth();
  const { getPreferenceArray, preferencesChargees } = usePreferences();

  // Ref synchronisée pendant le rendu (sans déclencher d'effet) pour la clé de session courante
  const modeRef = useRef(modeAffichage);
  modeRef.current = modeAffichage;

  // Capture si sessionStorage avait des données au montage (indépendamment de sessionEnabled,
  // car sessionEnabled peut être faux avant que les préférences ne chargent)
  const hadSessionFilter = useRef(!!readSessionFilter(modeAffichage));

  const [filtreAmenagement, setFiltreAmenagement] = useState<FiltreAmenagement>(() => {
    // Priorité 1 : filtre de session (seulement si activé)
    if (sessionEnabled) {
      const session = readSessionFilter(modeAffichage);
      if (session) return session;
    }
    // Priorité 2 : filtre favori des préférences / défaut
    return {
      ...getFiltreAmenagementDefault(auth.user as Utilisateur),
      ...{
        ...getPreferenceArray(getPrefKey(modeAffichage))?.filter((f) => f.favori)[0]?.filtre,
        page: 1,
      },
    };
  });

  // Persiste le filtre en session à chaque changement (clé = mode courant via ref, seulement si activé)
  useEffect(() => {
    if (sessionEnabled) {
      sessionStorage.setItem(getSessionKey(modeRef.current), JSON.stringify(filtreAmenagement));
    }
  }, [filtreAmenagement, sessionEnabled]);

  // Synchronisation lors du changement de mode d'affichage ou d'utilisateur
  // sessionEnabled n'est pas dans les deps : son changement est géré par l'effet preferencesChargees
  useEffect(() => {
    if (sessionEnabled) {
      const session = readSessionFilter(modeAffichage);
      if (session) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFiltreAmenagement(session);
        return;
      }
    }

    setFiltreAmenagement({
      ...getFiltreAmenagementDefault(auth.user as Utilisateur),
      ...{
        ...getPreferenceArray(getPrefKey(modeAffichage))?.filter((f) => f.favori)[0]?.filtre,
        page: 1,
      },
    });
  }, [modeAffichage, auth.user, getPreferenceArray]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronisation une fois les préférences chargées : point de vérité pour session + favori
  useEffect(() => {
    if (!preferencesChargees) return;

    // sessionEnabled est maintenant fiable : si activé et sessionStorage avait des données, les appliquer
    if (sessionEnabled && hadSessionFilter.current) {
      const session = readSessionFilter(modeAffichage);
      if (session) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFiltreAmenagement(session);
        return;
      }
    }

    // Session désactivée ou vide : appliquer le favori/défaut
    setFiltreAmenagement({
      ...getFiltreAmenagementDefault(auth.user as Utilisateur),
      ...getPreferenceArray(getPrefKey(modeAffichage))?.filter((f) => f.favori)[0]?.filtre,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesChargees]);

  return [filtreAmenagement, setFiltreAmenagement] as const;
}
