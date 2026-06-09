/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { createContext, useCallback, useContext, useReducer } from "react";
import { RoleValues } from "@lib";

// Types
export interface IDrawers {
  INTERVENANT?: string;
  BENEFICIAIRE?: string;
  EVENEMENT?: string;
  UTILISATEUR?: string;
  UTILISATEUR_ROLE?: RoleValues;
}

const initialDrawers: IDrawers = {
  INTERVENANT: undefined,
  BENEFICIAIRE: undefined,
  EVENEMENT: undefined,
  UTILISATEUR: undefined,
  UTILISATEUR_ROLE: undefined,
};

// Action types
const DRAWER_EVENEMENT = "DRAWER_EVENEMENT";
const DRAWER_UTILISATEUR = "DRAWER_UTILISATEUR";

type DrawersAction =
  | { type: typeof DRAWER_EVENEMENT; payload: string | undefined }
  | {
      type: typeof DRAWER_UTILISATEUR;
      payload: { utilisateur: string | undefined; role?: RoleValues } | undefined;
    };

// Reducer
const DrawerReducer = (state: IDrawers, action: DrawersAction): IDrawers => {
  switch (action.type) {
    case DRAWER_EVENEMENT:
      return {
        ...state,
        EVENEMENT: action.payload,
      };

    case DRAWER_UTILISATEUR:
      return {
        ...state,
        UTILISATEUR: action.payload?.utilisateur,
        UTILISATEUR_ROLE: action.payload?.role,
      };

    default:
      return state;
  }
};

export interface IDrawersContext {
  drawers: IDrawers;
  setDrawerUtilisateur: (
    value: { utilisateur: string | undefined; role?: RoleValues } | undefined,
  ) => void;
  setDrawerEvenement: (id: string | undefined) => void;
  closeAllDrawers: () => void;
}

const DrawersContext = createContext<IDrawersContext | undefined>(undefined);

export function DrawersProvider({ children }: { children: React.ReactNode }) {
  const [drawers, dispatch] = useReducer(DrawerReducer, initialDrawers);

  const setDrawerUtilisateur = useCallback(
    (value: { utilisateur: string | undefined; role?: RoleValues } | undefined) =>
      dispatch({ type: DRAWER_UTILISATEUR, payload: value }),
    [],
  );

  const setDrawerEvenement = useCallback(
    (id: string | undefined) => dispatch({ type: DRAWER_EVENEMENT, payload: id }),
    [],
  );

  const closeAllDrawers = useCallback(() => {
    dispatch({ type: DRAWER_UTILISATEUR, payload: undefined });
    dispatch({ type: DRAWER_EVENEMENT, payload: undefined });
  }, []);

  return (
    <DrawersContext.Provider
      value={{ drawers, setDrawerUtilisateur, setDrawerEvenement, closeAllDrawers }}
    >
      {children}
    </DrawersContext.Provider>
  );
}

export function useDrawers(): IDrawersContext {
  const ctx = useContext(DrawersContext);
  if (!ctx) throw new Error("useDrawers must be used within DrawersProvider");
  return ctx;
}
