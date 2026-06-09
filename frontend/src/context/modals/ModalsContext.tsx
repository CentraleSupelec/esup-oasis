/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { createContext, useCallback, useContext, useReducer } from "react";
import { IEvenement, IPartialEvenement } from "@api";

// Types
export interface IModals {
  INTERVENANT?: string;
  BENEFICIAIRE?: string;
  EVENEMENT_ID?: string;
  EVENEMENT?: IEvenement | IPartialEvenement;
}

const initialModals: IModals = {
  INTERVENANT: undefined,
  BENEFICIAIRE: undefined,
  EVENEMENT_ID: undefined,
  EVENEMENT: undefined,
};

// Action types
const MODAL_EVENEMENT_ID = "MODAL_EVENEMENT_ID";
const MODAL_EVENEMENT = "MODAL_EVENEMENT";

type ModalsAction =
  | { type: typeof MODAL_EVENEMENT_ID; payload: string | undefined }
  | { type: typeof MODAL_EVENEMENT; payload: IEvenement | IPartialEvenement | undefined };

// Reducer
const ModalReducer = (state: IModals, action: ModalsAction): IModals => {
  switch (action.type) {
    case MODAL_EVENEMENT_ID:
      return {
        ...state,
        EVENEMENT_ID: action.payload,
      };

    case MODAL_EVENEMENT:
      return {
        ...state,
        EVENEMENT: action.payload,
      };

    default:
      return state;
  }
};

interface IModalsContext {
  modals: IModals;
  setModalEvenementId: (id: string | undefined) => void;
  setModalEvenement: (evt: IEvenement | IPartialEvenement | undefined) => void;
}

const ModalsContext = createContext<IModalsContext | undefined>(undefined);

export function ModalsProvider({ children }: { children: React.ReactNode }) {
  const [modals, dispatch] = useReducer(ModalReducer, initialModals);

  const setModalEvenementId = useCallback(
    (id: string | undefined) => dispatch({ type: MODAL_EVENEMENT_ID, payload: id }),
    [],
  );

  const setModalEvenement = useCallback(
    (evt: IEvenement | IPartialEvenement | undefined) =>
      dispatch({ type: MODAL_EVENEMENT, payload: evt }),
    [],
  );

  return (
    <ModalsContext.Provider value={{ modals, setModalEvenementId, setModalEvenement }}>
      {children}
    </ModalsContext.Provider>
  );
}

export function useModals(): IModalsContext {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error("useModals must be used within ModalsProvider");
  return ctx;
}
