/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITag, ITypeAmenagement, PREFETCH_TAGS } from "@api";
import { useMemo, useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { FiltreAmenagement, filtreAmenagementToApi } from "@controls/Table/AmenagementTableLayout";
import {
  buildAmenagementsBenefDatasource,
  getTypesAmenagements,
  TypesDomainesAmenagements,
} from "@controls/Table/AmenagementsBeneficiaireTable";
import { DOMAINES_AMENAGEMENTS_INFOS, Utilisateur } from "@lib";
import { ModeAffichageAmenagement } from "@routes/gestionnaire/beneficiaires/Amenagements";
import { useAuth } from "@/auth/AuthProvider";
import { env } from "@/env";
import CsvExportButton from "@controls/Table/Export/CsvExportButton";

function getHeader(
  typesAmenagementsUtilises: TypesDomainesAmenagements[],
  user: Utilisateur | undefined,
) {
  const headers = [
    { label: "Nom", key: "nom" },
    { label: "Prénom", key: "prenom" },
    { label: "Email", key: "email" },
    { label: "Numéro étudiant", key: "numeroEtudiant" },
    { label: "Composante", key: "composante" },
    { label: "Formation", key: "formation" },
    user?.isGestionnaire ? { label: "Tags", key: "tags" } : null,
    user?.isGestionnaire
      ? { label: `Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`, key: "avisESE" }
      : null,
  ];

  Object.keys(DOMAINES_AMENAGEMENTS_INFOS)
    .filter((domainKey) => {
      return user?.isGestionnaire || DOMAINES_AMENAGEMENTS_INFOS[domainKey].visibleReferent;
    })
    .forEach((domaineKey) => {
      const domaine = DOMAINES_AMENAGEMENTS_INFOS[domaineKey];
      headers.push({
        label: `Nombre ${domaine.libelleLongPluriel}`,
        key: `${domaineKey}_count`,
      });

      typesAmenagementsUtilises
        .filter((ta) => ta.domaine.id === domaine.id)
        .forEach((ta) => {
          headers.push({
            label: ta.typeAmenagement.libelle.replaceAll('"', '""'),
            key: ta.typeAmenagement["@id"] as string,
          });
          headers.push({
            label: `${ta.typeAmenagement.libelle.replaceAll('"', '""')} - Commentaire`,
            key: `${ta.typeAmenagement["@id"]}_commentaire`,
          });
        });
    });

  return headers.filter((h) => h) as { label: string; key: string }[];
}

function formatAmenagementsBeneficiaireData(
  amenagements: any[],
  typesAmenagementsUtilises: TypesDomainesAmenagements[],
  tags?: ITag[],
) {
  return amenagements.map((amenagement) => {
    const data: any = {
      key: amenagement.key,
      "@id": amenagement.key,
      nom: amenagement.nom?.toLocaleUpperCase(),
      prenom: amenagement.prenom,
      email: amenagement.email,
      numeroEtudiant: amenagement.numeroEtudiant,
      composante: amenagement.inscription?.formation?.composante?.libelle?.replaceAll('"', '""'),
      formation: amenagement.inscription?.formation?.libelle?.replaceAll('"', '""'),
      tags:
        (amenagement.tags as string[])
          ?.map((tag) => tags?.find((t) => t["@id"] === tag))
          .map((tag) => tag?.libelle)
          .join(", ") || "",
      avisESE: amenagement?.etatAvisEse,
    };

    typesAmenagementsUtilises.forEach((ta) => {
      const am = amenagement[ta.typeAmenagement["@id"] as string];
      if (am) {
        data[ta.typeAmenagement["@id"] as string] = "Oui";
        data[`${ta.typeAmenagement["@id"]}_commentaire`] = (am.commentaire || "").replaceAll(
          '"',
          '""',
        );
      }
    });

    Object.keys(DOMAINES_AMENAGEMENTS_INFOS).forEach((domaineKey) => {
      const domaine = DOMAINES_AMENAGEMENTS_INFOS[domaineKey];
      data[`${domaineKey}_count`] = typesAmenagementsUtilises.filter(
        (c) => c.domaine.id === domaine.id && amenagement[c.typeAmenagement["@id"] as string],
      ).length;
    });

    return data;
  });
}

interface TableAmenagementsExportProps {
  filtreAmenagement: FiltreAmenagement;
  typesAmenagements: ITypeAmenagement[];
}

export default function AmenagementsBeneficiaireTableExport({
  filtreAmenagement,
  typesAmenagements,
}: TableAmenagementsExportProps) {
  const [{ exportKey, exportSubmit, prevFilter }, setExportState] = useState({
    exportKey: 0,
    exportSubmit: false,
    prevFilter: filtreAmenagement,
  });

  if (prevFilter !== filtreAmenagement) {
    setExportState((prev) => ({
      exportKey: prev.exportKey + 1,
      exportSubmit: false,
      prevFilter: filtreAmenagement,
    }));
  }

  const user = useAuth().user;

  const {
    data: amenagements,
    fetchedCount: amFetchedCount,
    totalItems: amTotalItems,
    isLoadingPage1: amIsLoadingPage1,
  } = useApi().useGetFullCollection({
    path: "/amenagements/utilisateurs",
    query: filtreAmenagementToApi(filtreAmenagement, ModeAffichageAmenagement.ParBeneficiaire),
    enabled: exportSubmit,
    concurrency: 5,
  });

  const {
    data: tags,
    fetchedCount: tagsFetchedCount,
    totalItems: tagsTotalItems,
  } = useApi().useGetFullCollection({
    ...PREFETCH_TAGS,
    enabled: exportSubmit,
  });

  const typesAmenagementsUtilises = useMemo(
    () =>
      getTypesAmenagements(amenagements?.items || [], typesAmenagements).sort((a, b) =>
        a.typeAmenagement.libelle.localeCompare(b.typeAmenagement.libelle),
      ),
    [amenagements?.items, typesAmenagements],
  );

  const data = useMemo(
    () => buildAmenagementsBenefDatasource(amenagements?.items || [], typesAmenagementsUtilises),
    [amenagements?.items, typesAmenagementsUtilises],
  );

  const refDataReady = !!(amenagements?.items && tags?.items);
  const globalFetchedCount = amFetchedCount + tagsFetchedCount;
  const globalTotalItems = amIsLoadingPage1 ? 0 : amTotalItems + tagsTotalItems;

  return (
    <CsvExportButton
      key={exportKey}
      getData={() =>
        formatAmenagementsBeneficiaireData(data || [], typesAmenagementsUtilises, tags?.items)
      }
      headers={getHeader(typesAmenagementsUtilises, user)}
      filename="amenagements"
      ready={refDataReady}
      fetchedCount={globalFetchedCount}
      totalItems={globalTotalItems}
      onStart={() => setExportState((prev) => ({ ...prev, exportSubmit: true }))}
    />
  );
}
