/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { FiltreDemande } from "@controls/Table/DemandeTable";
import { RefsTourDemandes } from "@routes/gestionnaire/demandeurs/Demandeurs";
import { UseStateDispatch } from "@utils/utils";
import { useDemandeFilterOptions } from "@controls/Table/hooks/useDemandeFilterOptions";
import { FilterFieldNomDemandeur } from "@controls/Table/filters/FilterFieldNomDemandeur";
import { FilterFieldTypesDemandes } from "@controls/Table/filters/FilterFieldTypesDemandes";
import { FilterFieldEtatDemande } from "@controls/Table/filters/FilterFieldEtatDemande";
import { FilterFieldGestionnairesDemande } from "@controls/Table/filters/FilterFieldGestionnairesDemande";
import { FilterFieldDisciplinesSportives } from "@controls/Table/filters/FilterFieldDisciplinesSportives";
import { FilterFieldComposantesDemande } from "@controls/Table/filters/FilterFieldComposantesDemande";
import { FilterFieldFormationsDemande } from "@controls/Table/filters/FilterFieldFormationsDemande";
import { FilterFieldArchivees } from "@controls/Table/filters/FilterFieldArchivees";
import { FilterPanel } from "@controls/Table/FilterPanel";

export function DemandeTableFilters(props: {
  filtreDemande: FiltreDemande;
  setFiltreDemande: UseStateDispatch<FiltreDemande>;
  defaultFilter: FiltreDemande;
  refs: RefsTourDemandes;
  affichageTour?: boolean;
}) {
  const {
    gestionnaires,
    isFetchingGestionnaires,
    disciplines,
    etats,
    composantes,
    formations,
    types,
  } = useDemandeFilterOptions(props.filtreDemande);

  return (
    <FilterPanel
      filtre={props.filtreDemande}
      setFiltre={props.setFiltreDemande}
      filtreType="filtresDemande"
      defaultFilter={props.defaultFilter}
      refDetails={props.refs.filtresDetails}
      refFavoris={props.refs.favoris as React.RefObject<HTMLDivElement>}
      refFiltres={props.refs.filtres as React.RefObject<HTMLDivElement>}
      activeKey={props.affichageTour ? ["filters", "filter_save"] : undefined}
      accordion={!props.affichageTour}
    >
      <FilterFieldNomDemandeur
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
      />
      <FilterFieldTypesDemandes
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
        types={types}
      />
      <FilterFieldEtatDemande
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
        etats={etats}
      />
      <FilterFieldGestionnairesDemande
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
        gestionnaires={gestionnaires}
        isFetchingGestionnaires={isFetchingGestionnaires}
      />
      <FilterFieldDisciplinesSportives
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
        disciplines={disciplines}
      />
      <FilterFieldComposantesDemande
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
        composantes={composantes}
      />
      <FilterFieldFormationsDemande
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
        formations={formations}
      />
      <FilterFieldArchivees
        filtreDemande={props.filtreDemande}
        setFiltreDemande={props.setFiltreDemande}
      />
    </FilterPanel>
  );
}
