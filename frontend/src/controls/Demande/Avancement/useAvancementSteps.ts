/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { useMemo } from "react";
import { StepsProps } from "antd";
import {
  ETAT_ATTENTE_ACCOMPAGNEMENT,
  ETAT_DEMANDE_CONFORME,
  ETAT_DEMANDE_RECEPTIONNEE,
  ETAT_DEMANDE_REFUSEE,
  ETAT_DEMANDE_VALIDEE,
  EtatInfo,
} from "@lib";
import { IDemande } from "@api";

type StepStatus = StepsProps["status"];

export const useAvancementSteps = (demande?: IDemande, etatDemande?: EtatInfo) => {
  const calculerEtatStep = useMemo(() => {
    return (etape: string): StepStatus => {
      if (!etatDemande || !demande) return "wait";

      switch (etape) {
        case "A":
          if (etatDemande.etape > "A" || demande.etat === ETAT_DEMANDE_RECEPTIONNEE)
            return "finish";
          return "process";

        case "B":
          if (etatDemande.etape > "B" || demande.etat === ETAT_DEMANDE_CONFORME) return "finish";
          if (demande.etat === ETAT_DEMANDE_RECEPTIONNEE) return "process";
          return "wait";

        case "D":
          if (demande.etat === ETAT_DEMANDE_VALIDEE || demande.etat === ETAT_DEMANDE_REFUSEE)
            return "finish";
          if (demande.etat === ETAT_ATTENTE_ACCOMPAGNEMENT) return "process";
          return "wait";
        default:
          return "wait";
      }
    };
  }, [demande, etatDemande]);

  return { calculerEtatStep };
};
