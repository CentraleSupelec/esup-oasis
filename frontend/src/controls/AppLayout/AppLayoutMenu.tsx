/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { Menu, MenuProps } from "antd";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { useTheme } from "@context/theme/ThemeContext";
import { useDrawers } from "@context/drawers/DrawersContext";
import { useAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { useIsFetching } from "@tanstack/react-query";
import PageTitle from "@utils/PageTitle/PageTitle";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";
import { menuItemNotifications } from "@controls/AppLayout/menuItems/MenuItemNotifications";
import { menuItemAccessibilite } from "@controls/AppLayout/menuItems/MenuItemAccessibilite";
import { menuItemTheme } from "@controls/AppLayout/menuItems/MenuItemTheme";
import { menuItemLogo } from "@controls/AppLayout/menuItems/MenuItemLogo";
import { menuItemPlanningBeneficiaireIntervenant } from "@controls/AppLayout/menuItems/MenuItemPlanningBeneficiaireIntervenant";
import { menuItemDemandeur } from "@controls/AppLayout/menuItems/MenuItemDemandeur";
import { menuItemServicesFaitsIntervenant } from "@controls/AppLayout/menuItems/MenuItemServicesFaitsIntervenant";
import { menuItemPlanningPlanificateur } from "@controls/AppLayout/menuItems/MenuItemPlanningPlanificateur";
import { menuItemBeneficiaires } from "@controls/AppLayout/menuItems/MenuItemBeneficiaires";
import { menuItemAmenagementsForReferents } from "@controls/AppLayout/menuItems/MenuItemAmenagementsForReferents";
import { menuItemDemandesForMembresCommission } from "@controls/AppLayout/menuItems/MenuItemDemandesForMembresCommission";
import { menuItemIntervenants } from "@controls/AppLayout/menuItems/MenuItemIntervenants";
import { menuItemDemandeurs } from "@controls/AppLayout/menuItems/MenuItemDemandeurs";
import { menuItemRecherche } from "@controls/AppLayout/menuItems/MenuItemRecherche";
import { menuItemUtilisateur } from "@controls/AppLayout/menuItems/MenuItemUtilisateur";

import { useNotificationStats } from "@controls/AppLayout/menuItems/useNotificationStats";
import { DARKMODE_ENABLED } from "@utils/theme/useEffectiveTheme";

/**
 * Render the application's horizontal menu layout.
 *
 * @return {ReactElement} The rendered menu component.
 */
export default function AppLayoutMenu(): ReactElement {
  const auth = useAuth();
  const navigate = useNavigate();
  const { setDrawerUtilisateur } = useDrawers();
  const { setAffichageFiltres } = useAffichageFiltres();
  const apiFetching = useIsFetching();
  const {
    accessibilite: appAccessibilite,
    setContrast,
    setDyslexieArial,
    setDyslexieOpenDys,
    setDyslexieLexend,
    setPoliceLarge,
  } = useAccessibilite();
  const { themeMode, setThemeMode } = useTheme();
  const [selectedKey, setSelectedKey] = useState<string>();
  const [modeRecherche, setModeRecherche] = useState(false);
  const { setPreference } = usePreferences();
  const { stats, isFetchingStats } = useNotificationStats();
  const menuItems: MenuProps["items"] = useMemo(() => {
    const items = [];

    items.push(...(menuItemLogo(setSelectedKey, navigate) || []));
    // Spécifique pour Planificateurs
    if (auth.user?.isPlanificateur) {
      items.push(...(menuItemDemandeurs(setSelectedKey, navigate) || []));
      items.push(...(menuItemBeneficiaires(setSelectedKey, navigate, auth.user) || []));
      items.push(...(menuItemIntervenants(setSelectedKey, navigate) || []));
      items.push(...(menuItemPlanningPlanificateur(setSelectedKey, auth.user, navigate) || []));
    }

    if (auth.user?.isDemandeur) {
      items.push(
        ...(menuItemDemandeur(
          setSelectedKey,
          navigate,
          auth.user?.isBeneficiaire || auth.user?.isIntervenant ? "" : "mr-auto",
        ) || []),
      );
    }

    if (auth.user?.isBeneficiaire && !auth.user?.isPlanificateur) {
      items.push(
        ...(menuItemPlanningBeneficiaireIntervenant(setSelectedKey, navigate, "mr-auto") || []),
      );
    } else if (auth.user?.isIntervenant && !auth.user?.isPlanificateur) {
      items.push(...(menuItemPlanningBeneficiaireIntervenant(setSelectedKey, navigate) || []));
      items.push(...(menuItemServicesFaitsIntervenant(setSelectedKey, navigate, "mr-auto") || []));
    }

    if (auth.user?.isCommissionMembre && !auth.user?.isPlanificateur) {
      items.push(...(menuItemDemandesForMembresCommission(setSelectedKey, navigate) || []));
    }

    if (auth.user?.isReferentComposante && !auth.user?.isPlanificateur) {
      items.push(...(menuItemAmenagementsForReferents(setSelectedKey, navigate) || []));
    }

    // Recherche
    if (auth.user?.isPlanificateur) {
      items.push(
        ...(menuItemRecherche(
          setDrawerUtilisateur,
          modeRecherche,
          setModeRecherche,
          auth.user,
          navigate,
        ) || []),
      );
    }

    // Thème (masqué si dark mode désactivé par la configuration)
    if (DARKMODE_ENABLED) {
      items.push(...(menuItemTheme(themeMode, setThemeMode, setPreference) || []));
    }

    // Accessibilité
    items.push(
      ...(menuItemAccessibilite(
        appAccessibilite,
        setContrast,
        setDyslexieArial,
        setDyslexieOpenDys,
        setDyslexieLexend,
        setPoliceLarge,
        setPreference,
      ) || []),
    );

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setDrawerUtilisateur,
    modeRecherche,
    navigate,
    auth,
    appAccessibilite,
    themeMode,
    setContrast,
    setDyslexieArial,
    setDyslexieOpenDys,
    setDyslexieLexend,
    setPoliceLarge,
    setThemeMode,
  ]);

  const menuNotifications: MenuProps["items"] = useMemo(() => {
    if (!auth.user || !auth.user.isPlanificateur) return [];
    return (
      menuItemNotifications(auth.user, navigate, setAffichageFiltres, stats, isFetchingStats) || []
    );
  }, [auth.user, setAffichageFiltres, isFetchingStats, navigate, stats]);

  // --- Rendre le menu accessible (fix ant design) ---
  useEffect(() => {
    // Aria label pour le menu accessibilité
    const menuAccessibiliteCtrl = document.querySelector(".item-accessibilite div[role=menuitem]");
    if (menuAccessibiliteCtrl) menuAccessibiliteCtrl.ariaLabel = "Menu accessibilité";

    // Aria label pour l'overflow du menu'
    const menuOverflow = document.querySelector(".ant-menu-overflow-item-rest");
    if (menuOverflow) {
      menuOverflow.ariaLabel = "Autres items du menu";
      menuOverflow.role = "menuitem";
    }
  });
  // --- /Rendre le menu accessible ---

  return (
    <>
      <PageTitle setSelectedMenuKey={setSelectedKey} />
      <Menu
        aria-label="Menu principal"
        selectedKeys={selectedKey ? [selectedKey] : []}
        mode="horizontal"
        items={[
          ...menuItems,
          ...menuNotifications,
          ...menuItemUtilisateur(setSelectedKey, auth, apiFetching, navigate),
        ]}
      />
    </>
  );
}
