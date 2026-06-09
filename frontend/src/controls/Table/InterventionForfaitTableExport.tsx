/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  IIntervenant,
  IInterventionForfait,
  IPeriode,
  ITypeEvenement,
  PREFETCH_TYPES_EVENEMENTS,
} from "@api";
import { useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { getLibellePeriode } from "@utils/dates";
import CsvExportButton from "@controls/Table/Export/CsvExportButton";

const headers: { label: string; key: string }[] = [
  { label: "Période", key: "periode" },
  { label: "Intervenant", key: "intervenant" },
  { label: "Intervenant (numéro étudiant)", key: "numeroEtudiant" },
  { label: "Catégorie d'évènement", key: "categorie" },
  { label: "Durée (en heures)", key: "duree" },
];

function getInterventionsForfaitData(
  interventionsForfait: IInterventionForfait[],
  intervenants: IIntervenant[] | undefined,
  periodes: IPeriode[] | undefined,
  typesEvenements: ITypeEvenement[] | undefined,
) {
  return interventionsForfait.map((interventionForfait) => {
    const periode = periodes?.find((p) => p["@id"] === interventionForfait.periode);
    const intervenant = intervenants?.find((i) => i["@id"] === interventionForfait.intervenant);
    return {
      key: interventionForfait["@id"],
      "@id": interventionForfait["@id"],
      periode: periode ? getLibellePeriode(periode?.debut, periode?.fin) : "",
      intervenant: intervenant
        ? `${intervenant?.nom?.toLocaleUpperCase()} ${intervenant?.prenom}`
        : "",
      numeroEtudiant: intervenant?.numeroEtudiant,
      categorie: typesEvenements
        ?.find((t) => t["@id"] === interventionForfait.type)
        ?.libelle?.replaceAll('"', '""'),
      duree: interventionForfait.heures,
    };
  });
}

interface TableInterventionsForfaitExportProps {
  interventionsForfait: IInterventionForfait[];
}

export default function InterventionForfaitTableExport({
  interventionsForfait,
}: TableInterventionsForfaitExportProps) {
  const [{ exportKey, exportSubmit, prevData }, setExportState] = useState({
    exportKey: 0,
    exportSubmit: false,
    prevData: interventionsForfait,
  });

  if (prevData !== interventionsForfait) {
    setExportState((prev) => ({
      exportKey: prev.exportKey + 1,
      exportSubmit: false,
      prevData: interventionsForfait,
    }));
  }

  const {
    data: periodes,
    fetchedCount: periodesFetchedCount,
    totalItems: periodesTotalItems,
    isLoadingPage1: periodesIsLoadingPage1,
  } = useApi().useGetFullCollection({
    path: "/periodes",
    enabled: exportSubmit,
  });
  const {
    data: intervenants,
    fetchedCount: intFetchedCount,
    totalItems: intTotalItems,
    isLoadingPage1: intIsLoadingPage1,
  } = useApi().useGetFullCollection({
    path: "/intervenants",
    enabled: exportSubmit,
  });
  const {
    data: typesEvenements,
    fetchedCount: typesFetchedCount,
    totalItems: typesTotalItems,
    isLoadingPage1: typesIsLoadingPage1,
  } = useApi().useGetFullCollection({
    ...PREFETCH_TYPES_EVENEMENTS,
    enabled: exportSubmit,
  });

  const globalFetchedCount = periodesFetchedCount + intFetchedCount + typesFetchedCount;
  const globalTotalItems =
    periodesIsLoadingPage1 || intIsLoadingPage1 || typesIsLoadingPage1
      ? 0
      : periodesTotalItems + intTotalItems + typesTotalItems;

  const refDataReady = !!(periodes?.items && intervenants?.items && typesEvenements?.items);

  return (
    <CsvExportButton
      key={exportKey}
      getData={() =>
        getInterventionsForfaitData(
          interventionsForfait,
          intervenants?.items,
          periodes?.items,
          typesEvenements?.items,
        )
      }
      headers={headers}
      filename="interventionsForfait"
      ready={refDataReady}
      fetchedCount={globalFetchedCount}
      totalItems={globalTotalItems}
      onStart={() => setExportState((prev) => ({ ...prev, exportSubmit: true }))}
    />
  );
}
