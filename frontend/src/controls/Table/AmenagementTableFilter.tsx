/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import {
  FiltreAmenagement,
  getFiltreAmenagementDefault,
} from "@controls/Table/AmenagementTableLayout";
import { ModeAffichageAmenagement } from "@routes/gestionnaire/beneficiaires/Amenagements";
import { Utilisateur } from "@lib";
import { useAmenagementFilterOptions } from "@controls/Table/hooks/useAmenagementFilterOptions";
import { FilterFieldNom } from "@controls/Table/filters/FilterFieldNom";
import { FilterFieldDomaine } from "@controls/Table/filters/FilterFieldDomaine";
import { FilterFieldCategories } from "@controls/Table/filters/FilterFieldCategories";
import { FilterFieldTypes } from "@controls/Table/filters/FilterFieldTypes";
import { FilterFieldGestionnaires } from "@controls/Table/filters/FilterFieldGestionnaires";
import { FilterFieldTags } from "@controls/Table/filters/FilterFieldTags";
import { FilterFieldAvisEse } from "@controls/Table/filters/FilterFieldAvisEse";
import { FilterFieldSuivis } from "@controls/Table/filters/FilterFieldSuivis";
import { FilterFieldComposantes } from "@controls/Table/filters/FilterFieldComposantes";
import { FilterFieldFormations } from "@controls/Table/filters/FilterFieldFormations";
import { FilterPanel } from "@controls/Table/FilterPanel";

export function AmenagementTableFilter(props: {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
  modeAffichage: ModeAffichageAmenagement;
}) {
  const {
    categoriesAmenagements,
    typesAmenagements,
    suivis,
    composantes,
    formations,
    tags,
    gestionnaires,
    isFetchingGestionnaires,
    estRenfort,
    estReferent,
    user,
  } = useAmenagementFilterOptions(props.filtreAmenagement);

  return (
    <FilterPanel
      filtre={props.filtreAmenagement}
      setFiltre={props.setFiltreAmenagement}
      filtreType={
        props.modeAffichage === ModeAffichageAmenagement.ParAmenagement
          ? "filtresAmenagement"
          : "filtresAmenagementParBeneficiaire"
      }
      defaultFilter={getFiltreAmenagementDefault(user as Utilisateur)}
    >
      <FilterFieldNom
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
      />

      <FilterFieldDomaine
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        modeAffichage={props.modeAffichage}
        estRenfort={estRenfort}
        estReferent={estReferent}
      />

      <FilterFieldCategories
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        categoriesAmenagements={categoriesAmenagements}
        typesAmenagements={typesAmenagements}
        user={user}
        estRenfort={estRenfort}
        estReferent={estReferent}
      />

      <FilterFieldTypes
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        typesAmenagements={typesAmenagements}
        estRenfort={estRenfort}
        estReferent={estReferent}
      />

      <FilterFieldGestionnaires
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        gestionnaires={gestionnaires}
        isFetchingGestionnaires={isFetchingGestionnaires}
        user={user}
      />

      <FilterFieldTags
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        tags={tags}
        estRenfort={estRenfort}
        estReferent={estReferent}
      />

      <FilterFieldAvisEse
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        modeAffichage={props.modeAffichage}
        estRenfort={estRenfort}
        estReferent={estReferent}
      />

      <FilterFieldSuivis
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        suivis={suivis}
        modeAffichage={props.modeAffichage}
      />

      <FilterFieldComposantes
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        composantes={composantes}
      />

      <FilterFieldFormations
        filtreAmenagement={props.filtreAmenagement}
        setFiltreAmenagement={props.setFiltreAmenagement}
        formations={formations}
      />
    </FilterPanel>
  );
}
