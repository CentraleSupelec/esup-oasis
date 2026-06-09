/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { FILTRE_INTERVENANT_DEFAULT, FiltreIntervenant } from "@controls/Table/IntervenantTable";
import { UseStateDispatch } from "@utils/utils";
import { useIntervenantFilterOptions } from "@controls/Table/hooks/useIntervenantFilterOptions";
import { FilterFieldNomIntervenant } from "@controls/Table/filters/FilterFieldNomIntervenant";
import { FilterFieldStatutIntervenant } from "@controls/Table/filters/FilterFieldStatutIntervenant";
import { FilterFieldCampus } from "@controls/Table/filters/FilterFieldCampus";
import { FilterFieldCompetences } from "@controls/Table/filters/FilterFieldCompetences";
import { FilterFieldTypesEvenements } from "@controls/Table/filters/FilterFieldTypesEvenements";
import { FilterPanel } from "@controls/Table/FilterPanel";

export function IntervenantTableFilter(props: {
  filtreIntervenant: FiltreIntervenant;
  setFiltreIntervenant: UseStateDispatch<FiltreIntervenant>;
}) {
  const { campuses, competences, categories } = useIntervenantFilterOptions(
    props.filtreIntervenant,
  );

  return (
    <FilterPanel
      filtre={props.filtreIntervenant}
      setFiltre={props.setFiltreIntervenant}
      filtreType="filtresIntervenant"
      defaultFilter={FILTRE_INTERVENANT_DEFAULT}
    >
      <FilterFieldNomIntervenant
        filtreIntervenant={props.filtreIntervenant}
        setFiltreIntervenant={props.setFiltreIntervenant}
      />
      <FilterFieldStatutIntervenant
        filtreIntervenant={props.filtreIntervenant}
        setFiltreIntervenant={props.setFiltreIntervenant}
      />
      <FilterFieldCampus
        filtreIntervenant={props.filtreIntervenant}
        setFiltreIntervenant={props.setFiltreIntervenant}
        campuses={campuses}
      />
      <FilterFieldCompetences
        filtreIntervenant={props.filtreIntervenant}
        setFiltreIntervenant={props.setFiltreIntervenant}
        competences={competences}
      />
      <FilterFieldTypesEvenements
        filtreIntervenant={props.filtreIntervenant}
        setFiltreIntervenant={props.setFiltreIntervenant}
        categories={categories}
      />
    </FilterPanel>
  );
}
