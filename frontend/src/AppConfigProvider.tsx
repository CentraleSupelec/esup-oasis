/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useMemo } from "react";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { ConfigProvider } from "antd";
import frFR from "antd/locale/fr_FR";
import { useEffectiveTheme } from "@utils/theme/useEffectiveTheme";
import { buildCssVars, buildTheme } from "@/themeBuilder";

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const { accessibilite } = useAccessibilite();
  const effectiveTheme = useEffectiveTheme();

  useEffect(() => {
    const vars = buildCssVars(accessibilite.contrast, effectiveTheme);
    Object.entries(vars).forEach(([key, value]) =>
      document.documentElement.style.setProperty(key, value),
    );
  }, [accessibilite.contrast, effectiveTheme]);

  const antTheme = useMemo(
    () => buildTheme(effectiveTheme, accessibilite),
    [effectiveTheme, accessibilite],
  );

  return (
    <ConfigProvider locale={frFR} theme={antTheme}>
      {children}
    </ConfigProvider>
  );
}
