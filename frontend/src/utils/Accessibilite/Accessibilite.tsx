/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect } from "react";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { useEffectiveTheme } from "@utils/theme/useEffectiveTheme";

/**
 * Gère les paramètres d'accessibilité de l'application.
 * Ajoute ou supprime des classes au corps du document en fonction des paramètres d'accessibilité.
 * Retourne un élément React vide afin de l'insérer dans le rendu de la page sans rien afficher.
 *
 * @returns {ReactElement} The component JSX element.
 */
export default function Accessibilite(): ReactElement {
  const { accessibilite: appAccessibilite } = useAccessibilite();
  const effectiveTheme = useEffectiveTheme();

  useEffect(() => {
    document.body.classList.toggle("accessibilite-contraste", appAccessibilite.contrast);
    document.body.classList.toggle("accessibilite-dyslexie-arial", appAccessibilite.dyslexieArial);
    document.body.classList.toggle(
      "accessibilite-dyslexie-lexend",
      appAccessibilite.dyslexieLexend,
    );
    document.body.classList.toggle(
      "accessibilite-dyslexie-open-dys",
      appAccessibilite.dyslexieOpenDys,
    );
    document.body.classList.toggle("accessibilite-police-large", appAccessibilite.policeLarge);
  }, [appAccessibilite]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", effectiveTheme === "dark");
  }, [effectiveTheme]);

  return <></>;
}
