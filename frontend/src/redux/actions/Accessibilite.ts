/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { AnyAction } from "redux";
import {
   ACCESSIBILITE_CONTRAST,
   ACCESSIBILITE_DYSLEXIE_ARIAL,
   ACCESSIBILITE_DYSLEXIE_LEXEND,
   ACCESSIBILITE_DYSLEXIE_OPENDYS,
   ACCESSIBILITE_POLICE_LARGE,
} from "../ReduxConstants";

export const setAccessibiliteContrast = (value: boolean | undefined): AnyAction => {
   return {
      type: ACCESSIBILITE_CONTRAST,
      payload: value,
   };
};

export const setAccessibiliteDyslexieArial = (value: boolean | undefined): AnyAction => {
   return {
      type: ACCESSIBILITE_DYSLEXIE_ARIAL,
      payload: value,
   };
};

export const setAccessibiliteDyslexieOpenDys = (value: boolean | undefined): AnyAction => {
   return {
      type: ACCESSIBILITE_DYSLEXIE_OPENDYS,
      payload: value,
   };
};

export const setAccessibiliteDyslexieLexend = (value: boolean | undefined): AnyAction => {
   return {
      type: ACCESSIBILITE_DYSLEXIE_LEXEND,
      payload: value,
   };
};

export const setPoliceLarge = (value: boolean | undefined): AnyAction => {
   return {
      type: ACCESSIBILITE_POLICE_LARGE,
      payload: value,
   };
};
