/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect } from "react";
import { IAccessibilite } from "../../redux/context/IAccessibilite";
import { useSelector } from "react-redux";
import { IStore } from "../../redux/Store";

/**
 * Gère les paramètres d'accessibilité de l'application.
 * Ajoute ou supprime des classes au corps du document en fonction des paramètres d'accessibilité.
 * Retourne un élément React vide afin de l'insérer dans le rendu de la page sans rien afficher.
 *
 * @returns {ReactElement} The component JSX element.
 */
export default function Accessibilite(): ReactElement {
   const appAccessibilite: IAccessibilite = useSelector(
      ({ accessibilite }: Partial<IStore>) => accessibilite,
   ) as IAccessibilite;

   useEffect(() => {
      if (appAccessibilite.contrast) {
         document.body.classList.add("accessibilite-contraste");
      } else {
         document.body.classList.remove("accessibilite-contraste");
      }

      if (appAccessibilite.dyslexieArial) {
         document.body.classList.add("accessibilite-dyslexie-arial");
      } else {
         document.body.classList.remove("accessibilite-dyslexie-arial");
      }

      if (appAccessibilite.dyslexieLexend) {
         document.body.classList.add("accessibilite-dyslexie-lexend");
      } else {
         document.body.classList.remove("accessibilite-dyslexie-lexend");
      }

      if (appAccessibilite.dyslexieOpenDys) {
         document.body.classList.add("accessibilite-dyslexie-open-dys");
      } else {
         document.body.classList.remove("accessibilite-dyslexie-open-dys");
      }

      if (appAccessibilite.policeLarge) {
         document.body.classList.add("accessibilite-police-large");
      } else {
         document.body.classList.remove("accessibilite-police-large");
      }
   }, [appAccessibilite]);

   return <></>;
}
