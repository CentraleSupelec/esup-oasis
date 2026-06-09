/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { createContext, useCallback, useContext, useReducer } from "react";
import { firstFridayAfter, firstMondayBefore } from "@utils/dates";
import { AffectationFilterValues } from "@controls/Filters/Affectation/AffectationFilter";
import { AnnulationFilterValues } from "@controls/Filters/Annulation/AnnulationFilter";
import dayjs from "dayjs";
import { Evenement, RoleValues } from "@lib";
import { DateAsString } from "@utils/string";

// Types
export interface IFiltresEvenements {
  debut: Date;
  fin: Date;
  "exists[intervenant]"?: AffectationFilterValues;
  "exists[dateAnnulation]"?: AnnulationFilterValues;
  "campus[]"?: string[];
  "utilisateurCreation[]"?: string[];
  intervenant?: string;
  beneficiaire?: string;
  intervenantBeneficiaire?: string;
  intervenantBeneficiaireRole?: RoleValues.ROLE_INTERVENANT | RoleValues.ROLE_BENEFICIAIRE;
  type?: string[];
}

export interface IFiltresEvenementsApi {
  "debut[after]"?: DateAsString;
  "fin[before]"?: DateAsString;
  "exists[intervenant]"?: boolean;
  "exists[dateAnnulation]"?: boolean;
  "campus[]"?: string[];
  "utilisateurCreation[]"?: string[];
  intervenant?: string;
  beneficiaires?: string;
  "type[]"?: string[];
}

export enum DensiteValues {
  compact = "Compact",
  normal = "Normal",
  large = "Large",
}

export type TypeAffichageValues = "day" | "week" | "work_week" | "month" | "agenda";
export type TypeAffichageCustomValues = TypeAffichageValues | "custom";

export interface IAffichage {
  layout: PlanningLayout;
  type: TypeAffichageCustomValues;
  densite: DensiteValues;
  fitToScreen: boolean;
}

export enum PlanningLayout {
  calendar = "calendar",
  table = "table",
}

export interface IAffichageFiltres {
  affichage: IAffichage;
  filtres: IFiltresEvenements;
}

export const initialAffichageFiltres: IAffichageFiltres = {
  affichage: {
    type: "work_week",
    densite: DensiteValues.normal,
    fitToScreen: false,
    layout: PlanningLayout.calendar,
  },
  filtres: {
    debut: firstMondayBefore(new Date()),
    fin: firstFridayAfter(new Date()),
    "exists[intervenant]": undefined,
    "exists[dateAnnulation]": AnnulationFilterValues.EnCours,
  },
};

export const filtreToApiOnBackend = (filtre: IFiltresEvenements): IFiltresEvenementsApi => {
  const filtreApi: IFiltresEvenementsApi = {
    "debut[after]": filtre.debut ? dayjs(filtre.debut).format("YYYY-MM-DD 00:00:00") : undefined,
    "fin[before]": filtre.fin ? dayjs(filtre.fin).format("YYYY-MM-DD 23:59:59") : undefined,
    "campus[]": filtre["campus[]"],
    "utilisateurCreation[]": filtre["utilisateurCreation[]"],
    intervenant: filtre.intervenant,
    beneficiaires: filtre.beneficiaire,
    "type[]": filtre.type,
  };

  // Intervenant / Bénéficiaire
  if (filtre.intervenantBeneficiaire) {
    if (filtre.intervenantBeneficiaireRole === RoleValues.ROLE_BENEFICIAIRE) {
      filtreApi.beneficiaires = filtre.intervenantBeneficiaire;
    } else if (filtre.intervenantBeneficiaireRole === RoleValues.ROLE_INTERVENANT) {
      filtreApi.intervenant = filtre.intervenantBeneficiaire;
    }
  }

  // Affecté ?
  if (filtre["exists[intervenant]"] === AffectationFilterValues.Affectes) {
    filtreApi["exists[intervenant]"] = true;
  } else if (filtre["exists[intervenant]"] === AffectationFilterValues.NonAffectes) {
    filtreApi["exists[intervenant]"] = false;
  } else {
    delete filtreApi["exists[intervenant]"];
  }

  // Annulé ?
  if (filtre["exists[dateAnnulation]"] === AnnulationFilterValues.EnCours) {
    filtreApi["exists[dateAnnulation]"] = false;
  } else if (filtre["exists[dateAnnulation]"] === AnnulationFilterValues.Annules) {
    filtreApi["exists[dateAnnulation]"] = true;
  } else {
    delete filtreApi["exists[dateAnnulation]"];
  }

  return filtreApi;
};

export const filtreToApi = (filtre: IFiltresEvenements): IFiltresEvenementsApi => {
  return {
    "debut[after]": filtre.debut ? dayjs(filtre.debut).format("YYYY-MM-DD 00:00:00") : undefined,
    "fin[before]": filtre.fin ? dayjs(filtre.fin).format("YYYY-MM-DD 23:59:59") : undefined,
  };
};

export const filtrerEvenements = (
  evenements: Evenement[],
  filtre: IFiltresEvenements,
): Evenement[] => {
  let res = evenements;

  // Intervenant / Bénéficiaire
  if (filtre.intervenantBeneficiaire) {
    if (filtre.intervenantBeneficiaireRole === RoleValues.ROLE_BENEFICIAIRE) {
      res = res.filter((e) => e.beneficiaires.some((b) => b === filtre.intervenantBeneficiaire));
    } else if (filtre.intervenantBeneficiaireRole === RoleValues.ROLE_INTERVENANT) {
      res = res.filter((e) => e.intervenant === filtre.intervenantBeneficiaire);
    }
  }

  // Affecté ?
  if (filtre["exists[intervenant]"] === AffectationFilterValues.Affectes) {
    res = res.filter((e) => e.intervenant);
  } else if (filtre["exists[intervenant]"] === AffectationFilterValues.NonAffectes) {
    res = res.filter((e) => !e.intervenant);
  }

  // Annulé ?
  if (filtre["exists[dateAnnulation]"] === AnnulationFilterValues.EnCours) {
    res = res.filter((e) => !e.dateAnnulation);
  } else if (filtre["exists[dateAnnulation]"] === AnnulationFilterValues.Annules) {
    res = res.filter((e) => e.dateAnnulation);
  }

  // Campus
  if (filtre["campus[]"] && filtre["campus[]"].length > 0) {
    res = res.filter((e) => filtre["campus[]"]?.includes(e.campus as string));
  }

  // Utilisateur de création
  if (filtre["utilisateurCreation[]"] && filtre["utilisateurCreation[]"].length > 0) {
    res = res.filter((e) =>
      filtre["utilisateurCreation[]"]?.includes(e.utilisateurCreation as string),
    );
  }

  // Intervenant
  if (filtre.intervenant) {
    res = res.filter((e) => e.intervenant === filtre.intervenant);
  }

  // Bénéficiaire
  if (filtre.beneficiaire) {
    res = res.filter((e) => e.beneficiaires.some((b) => b === filtre.beneficiaire));
  }

  // Type
  if (filtre.type) {
    res = res.filter((e) => filtre.type?.some((t) => t === e.type));
  }

  return res;
};

// Action types
const AFFICHAGE_AFFICHAGE = "AFFICHAGE_AFFICHAGE";
const AFFICHAGE_FILTRE = "AFFICHAGE_FILTRE";
const AFFICHAGE_AFFICHAGE_FILTRE = "AFFICHAGE_AFFICHAGE_FILTRE";
const SET_AFFICHAGE_FILTRE = "SET_AFFICHAGE_FILTRE";

type AffichageFiltresAction =
  | { type: typeof AFFICHAGE_AFFICHAGE; payload: Partial<IAffichage> }
  | { type: typeof AFFICHAGE_FILTRE; payload: Partial<IFiltresEvenements> }
  | {
      type: typeof AFFICHAGE_AFFICHAGE_FILTRE;
      payload: { affichage: Partial<IAffichage>; filtres: Partial<IFiltresEvenements> };
    }
  | { type: typeof SET_AFFICHAGE_FILTRE; payload: { filtres: IFiltresEvenements } };

// Reducer
const AffichageFiltresReducer = (
  state: IAffichageFiltres,
  action: AffichageFiltresAction,
): IAffichageFiltres => {
  switch (action.type) {
    case AFFICHAGE_AFFICHAGE:
      return {
        ...state,
        affichage: { ...state.affichage, ...action.payload },
      };

    case AFFICHAGE_FILTRE:
      return {
        ...state,
        filtres: { ...state.filtres, ...action.payload },
      };

    case AFFICHAGE_AFFICHAGE_FILTRE:
      return {
        ...state,
        affichage: { ...state.affichage, ...action.payload.affichage },
        filtres: { ...state.filtres, ...action.payload.filtres },
      };

    case SET_AFFICHAGE_FILTRE:
      return {
        affichage: { ...state.affichage },
        filtres: { ...action.payload.filtres },
      };

    default:
      return state;
  }
};

export interface IAffichageFiltresContext {
  affichageFiltres: IAffichageFiltres;
  setAffichage: (value: Partial<IAffichage>) => void;
  setFiltres: (value: Partial<IFiltresEvenements>, replace?: boolean) => void;
  setAffichageFiltres: (
    affichage: Partial<IAffichage>,
    filtres: Partial<IFiltresEvenements>,
  ) => void;
  restoreFiltres: (value: IFiltresEvenements) => void;
}

const AffichageFiltresContext = createContext<IAffichageFiltresContext | undefined>(undefined);

export function AffichageFiltresProvider({ children }: { children: React.ReactNode }) {
  const [affichageFiltres, dispatch] = useReducer(AffichageFiltresReducer, initialAffichageFiltres);

  const setAffichage = useCallback(
    (value: Partial<IAffichage>) => dispatch({ type: AFFICHAGE_AFFICHAGE, payload: value }),
    [],
  );

  const setFiltres = useCallback((value: Partial<IFiltresEvenements>, replace?: boolean) => {
    if (replace) {
      dispatch({
        type: SET_AFFICHAGE_FILTRE,
        payload: { filtres: value as IFiltresEvenements },
      });
    } else {
      dispatch({ type: AFFICHAGE_FILTRE, payload: value });
    }
  }, []);

  const setAffichageFiltres = useCallback(
    (affichage: Partial<IAffichage>, filtres: Partial<IFiltresEvenements>) =>
      dispatch({ type: AFFICHAGE_AFFICHAGE_FILTRE, payload: { affichage, filtres } }),
    [],
  );

  const restoreFiltres = useCallback(
    (value: IFiltresEvenements) =>
      dispatch({ type: SET_AFFICHAGE_FILTRE, payload: { filtres: value } }),
    [],
  );

  return (
    <AffichageFiltresContext.Provider
      value={{ affichageFiltres, setAffichage, setFiltres, setAffichageFiltres, restoreFiltres }}
    >
      {children}
    </AffichageFiltresContext.Provider>
  );
}

export function useAffichageFiltres(): IAffichageFiltresContext {
  const ctx = useContext(AffichageFiltresContext);
  if (!ctx) throw new Error("useAffichageFiltres must be used within AffichageFiltresProvider");
  return ctx;
}
