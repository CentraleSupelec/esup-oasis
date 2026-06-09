/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { Evenement } from "@lib";
import dayjs from "dayjs";
import {
  ICampus,
  ITypeEvenement,
  IUtilisateur,
  PREFETCH_CAMPUS,
  PREFETCH_TYPES_EVENEMENTS,
} from "@api";
import CsvExportButton from "@controls/Table/Export/CsvExportButton";

const headers = [
  { label: "Début", key: "debut" },
  { label: "Fin", key: "fin" },
  { label: "Catégorie d'évènement", key: "categorie" },
  { label: "Bénéficiaires", key: "beneficiaires" },
  { label: "Intervenant / Renfort", key: "intervenant" },
  { label: "Campus", key: "campus" },
  { label: "Transmis à la RH", key: "transmisRh" },
];

function getEvenementsData(
  evenements: Evenement[],
  typesEvenements: ITypeEvenement[] | undefined,
  beneficiaires: IUtilisateur[] | undefined,
  intervenants: IUtilisateur[] | undefined,
  campus: ICampus[] | undefined,
) {
  return evenements.map((evenement) => {
    const intervenant = intervenants?.find((i) => i["@id"] === evenement.intervenant);
    return {
      key: evenement["@id"],
      "@id": evenement["@id"],
      debut: evenement.debut ? dayjs(evenement.debut).format("DD/MM/YYYY HH:mm") : "",
      fin: evenement.debut ? dayjs(evenement.fin).format("DD/MM/YYYY HH:mm") : "",
      categorie: evenement.type
        ? typesEvenements?.find((t) => t["@id"] === evenement.type)?.libelle?.replaceAll('"', '""')
        : "",
      beneficiaires: evenement.beneficiaires
        ?.map((beneficiaire) => beneficiaires?.find((b) => b["@id"] === beneficiaire))
        .map((beneficiaire) => `${beneficiaire?.nom?.toLocaleUpperCase()} ${beneficiaire?.prenom}`)
        .join(", "),
      intervenant: intervenant
        ? `${intervenant?.nom?.toLocaleUpperCase()} ${intervenant?.prenom}`
        : "",
      campus: campus?.find((c) => c["@id"] === evenement.campus)?.libelle?.replaceAll('"', '""'),
      transmisRh: evenement.isTransmisRH() ? "Oui" : "Non",
    };
  });
}

interface TableEvenementsExportProps {
  evenements: Evenement[];
}

export default function EvenementTableExport({ evenements }: TableEvenementsExportProps) {
  const [{ exportKey, exportSubmit, prevData }, setExportState] = useState({
    exportKey: 0,
    exportSubmit: false,
    prevData: evenements,
  });

  if (prevData !== evenements) {
    setExportState((prev) => ({
      exportKey: prev.exportKey + 1,
      exportSubmit: false,
      prevData: evenements,
    }));
  }

  const {
    data: beneficiaires,
    fetchedCount: benefFetchedCount,
    totalItems: benefTotalItems,
    isLoadingPage1: benefIsLoadingPage1,
  } = useApi().useGetFullCollection({
    path: "/beneficiaires",
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
    data: campus,
    fetchedCount: campusFetchedCount,
    totalItems: campusTotalItems,
    isLoadingPage1: campusIsLoadingPage1,
  } = useApi().useGetFullCollection({
    ...PREFETCH_CAMPUS,
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

  const globalFetchedCount =
    benefFetchedCount + intFetchedCount + campusFetchedCount + typesFetchedCount;
  const globalTotalItems =
    benefIsLoadingPage1 || typesIsLoadingPage1 || campusIsLoadingPage1 || intIsLoadingPage1
      ? 0
      : benefTotalItems + intTotalItems + campusTotalItems + typesTotalItems;

  const refDataReady = !!(
    beneficiaires?.items &&
    intervenants?.items &&
    campus?.items &&
    typesEvenements?.items
  );

  return (
    <CsvExportButton
      key={exportKey}
      getData={() =>
        getEvenementsData(
          evenements,
          typesEvenements?.items,
          beneficiaires?.items,
          intervenants?.items,
          campus?.items,
        )
      }
      headers={headers}
      filename="evenements"
      ready={refDataReady}
      fetchedCount={globalFetchedCount}
      totalItems={globalTotalItems}
      onStart={() => setExportState((prev) => ({ ...prev, exportSubmit: true }))}
    />
  );
}
