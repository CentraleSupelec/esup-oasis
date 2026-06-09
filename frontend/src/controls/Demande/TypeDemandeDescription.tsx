/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import React from "react";
import { ITypeDemande } from "@api";
import { CampagneDemandeDateItem } from "@controls/Items/CampagneDemandeDateItem";

interface ITypeDemandeDescriptionProps {
  typeDemande: ITypeDemande;
}

export function TypeDemandeDescription({ typeDemande }: ITypeDemandeDescriptionProps) {
  if (typeDemande.campagneEnCours)
    return (
      <CampagneDemandeDateItem
        campagneDemandeId={typeDemande.campagneEnCours}
        templateString="Campagne ouverte du {{debut}} au {{fin}}."
      />
    );

  if (typeDemande.campagneSuivante) {
    return (
      <CampagneDemandeDateItem
        campagneDemandeId={typeDemande.campagneSuivante}
        templateString="Campagne fermée. Prochaine campagne du {{debut}} au {{fin}}."
      />
    );
  }

  if (typeDemande.campagnePrecedente) {
    return (
      <CampagneDemandeDateItem
        campagneDemandeId={typeDemande.campagnePrecedente}
        templateString="Campagne fermée depuis le {{fin}}."
      />
    );
  }

  return "Aucune campagne ouverte.";
}
