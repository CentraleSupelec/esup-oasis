/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { createContext, useCallback, useContext, useReducer } from "react";

export interface IAccessibilite {
  contrast: boolean;
  dyslexieArial: boolean;
  dyslexieOpenDys: boolean;
  dyslexieLexend: boolean;
  policeLarge: boolean;
}

const initialAccessibilite: IAccessibilite = {
  contrast: false,
  dyslexieArial: false,
  dyslexieOpenDys: false,
  dyslexieLexend: false,
  policeLarge: false,
};

const ACCESSIBILITE_CONTRAST = "ACCESSIBILITE_CONTRAST";
const ACCESSIBILITE_DYSLEXIE_ARIAL = "ACCESSIBILITE_DYSLEXIE_ARIAL";
const ACCESSIBILITE_DYSLEXIE_OPENDYS = "ACCESSIBILITE_DYSLEXIE_OPENDYS";
const ACCESSIBILITE_DYSLEXIE_LEXEND = "ACCESSIBILITE_DYSLEXIE_LEXEND";
const ACCESSIBILITE_POLICE_LARGE = "ACCESSIBILITE_POLICE_LARGE";

type AccessibiliteAction =
  | { type: typeof ACCESSIBILITE_CONTRAST; payload: boolean }
  | { type: typeof ACCESSIBILITE_DYSLEXIE_ARIAL; payload: boolean }
  | { type: typeof ACCESSIBILITE_DYSLEXIE_OPENDYS; payload: boolean }
  | { type: typeof ACCESSIBILITE_DYSLEXIE_LEXEND; payload: boolean }
  | { type: typeof ACCESSIBILITE_POLICE_LARGE; payload: boolean };

const AccessibiliteReducer = (
  state: IAccessibilite,
  action: AccessibiliteAction,
): IAccessibilite => {
  switch (action.type) {
    case ACCESSIBILITE_CONTRAST:
      return { ...state, contrast: action.payload };

    case ACCESSIBILITE_DYSLEXIE_ARIAL:
      return {
        ...state,
        dyslexieArial: action.payload,
        dyslexieOpenDys: action.payload ? false : state.dyslexieOpenDys,
        dyslexieLexend: action.payload ? false : state.dyslexieLexend,
      };

    case ACCESSIBILITE_DYSLEXIE_OPENDYS:
      return {
        ...state,
        dyslexieOpenDys: action.payload,
        dyslexieArial: action.payload ? false : state.dyslexieArial,
        dyslexieLexend: action.payload ? false : state.dyslexieLexend,
      };

    case ACCESSIBILITE_DYSLEXIE_LEXEND:
      return {
        ...state,
        dyslexieLexend: action.payload,
        dyslexieArial: action.payload ? false : state.dyslexieArial,
        dyslexieOpenDys: action.payload ? false : state.dyslexieOpenDys,
      };

    case ACCESSIBILITE_POLICE_LARGE:
      return { ...state, policeLarge: action.payload };

    default:
      return state;
  }
};

interface IAccessibiliteContext {
  accessibilite: IAccessibilite;
  setContrast: (value: boolean) => void;
  setDyslexieArial: (value: boolean) => void;
  setDyslexieOpenDys: (value: boolean) => void;
  setDyslexieLexend: (value: boolean) => void;
  setPoliceLarge: (value: boolean) => void;
}

const AccessibiliteContext = createContext<IAccessibiliteContext | undefined>(undefined);

export function AccessibiliteProvider({ children }: { children: React.ReactNode }) {
  const [accessibilite, dispatch] = useReducer(AccessibiliteReducer, initialAccessibilite);

  const setContrast = useCallback(
    (value: boolean) => dispatch({ type: ACCESSIBILITE_CONTRAST, payload: value }),
    [],
  );
  const setDyslexieArial = useCallback(
    (value: boolean) => dispatch({ type: ACCESSIBILITE_DYSLEXIE_ARIAL, payload: value }),
    [],
  );
  const setDyslexieOpenDys = useCallback(
    (value: boolean) => dispatch({ type: ACCESSIBILITE_DYSLEXIE_OPENDYS, payload: value }),
    [],
  );
  const setDyslexieLexend = useCallback(
    (value: boolean) => dispatch({ type: ACCESSIBILITE_DYSLEXIE_LEXEND, payload: value }),
    [],
  );
  const setPoliceLarge = useCallback(
    (value: boolean) => dispatch({ type: ACCESSIBILITE_POLICE_LARGE, payload: value }),
    [],
  );

  return (
    <AccessibiliteContext.Provider
      value={{
        accessibilite,
        setContrast,
        setDyslexieArial,
        setDyslexieOpenDys,
        setDyslexieLexend,
        setPoliceLarge,
      }}
    >
      {children}
    </AccessibiliteContext.Provider>
  );
}

export function useAccessibilite(): IAccessibiliteContext {
  const ctx = useContext(AccessibiliteContext);
  if (!ctx) throw new Error("useAccessibilite must be used within AccessibiliteProvider");
  return ctx;
}
