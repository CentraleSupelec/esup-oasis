/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  IBeneficiaire,
  IComposante,
  ITag,
  IUtilisateur,
  PREFETCH_COMPOSANTES,
  PREFETCH_TAGS,
} from "@api";
import { useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";
import { env } from "@/env";
import CsvExportButton from "@controls/Table/Export/CsvExportButton";

const headers = [
  { label: "Nom", key: "nom" },
  { label: "Prénom", key: "prenom" },
  { label: "Email", key: "email" },
  { label: "Numéro étudiant", key: "numeroEtudiant" },
  { label: "Composantes", key: "composantes" },
  { label: "Formations", key: "formations" },
  { label: "Gestionnaires", key: "gestionnaires" },
  { label: "Tags", key: "tags" },
  { label: `Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`, key: "avisESE" },
];

function getBeneficiairesData(
  beneficiaires: IBeneficiaire[],
  composantes: IComposante[] | undefined,
  gestionnaires: IUtilisateur[] | undefined,
  tags: ITag[] | undefined,
) {
  return beneficiaires.map((beneficiaire) => {
    return {
      key: beneficiaire["@id"],
      "@id": beneficiaire["@id"],
      nom: beneficiaire.nom?.toLocaleUpperCase(),
      prenom: beneficiaire.prenom,
      email: beneficiaire.email,
      numeroEtudiant: beneficiaire.numeroEtudiant,
      composantes: beneficiaire.inscriptions
        ?.map((inscription) => inscription.formation)
        ?.map((formation) => formation?.composante)
        ?.map((composante) => {
          if (!composante) return null;
          return composantes?.find((c) => c["@id"] === composante);
        })
        .map((composante) => composante?.libelle?.replaceAll('"', '""'))
        .join(", "),
      formations: beneficiaire.inscriptions
        ?.map((inscription) => inscription.formation)
        ?.map((formation) => {
          if (!formation) return null;
          if (formation.codeExterne) {
            return `[${formation.codeExterne}] ${formation.libelle?.replaceAll('"', '""')}`;
          }
          return `${formation.libelle?.replaceAll('"', '""')}`;
        })
        .join(", "),
      gestionnaires: beneficiaire.gestionnairesActifs
        ?.map((gestionnaire) => gestionnaires?.find((g) => g["@id"] === gestionnaire))
        .map((gestionnaire) => `${gestionnaire?.nom?.toLocaleUpperCase()} ${gestionnaire?.prenom}`)
        .join(", "),
      avisESE: beneficiaire.etatAvisEse,
      tags: beneficiaire.tags
        ?.map((tag) => tags?.find((t) => t["@id"] === tag))
        .map((tag) => tag?.libelle?.replaceAll('"', '""'))
        .join(", "),
    };
  });
}

interface TableBeneficiairesExportProps {
  filtreBeneficiaire: FiltreBeneficiaire;
}

export default function BeneficiaireTableExport({
  filtreBeneficiaire,
}: TableBeneficiairesExportProps) {
  const [{ exportKey, exportSubmit, prevFilter }, setExportState] = useState({
    exportKey: 0,
    exportSubmit: false,
    prevFilter: filtreBeneficiaire,
  });

  if (prevFilter !== filtreBeneficiaire) {
    setExportState((prev) => ({
      exportKey: prev.exportKey + 1,
      exportSubmit: false,
      prevFilter: filtreBeneficiaire,
    }));
  }

  const { data: composantes } = useApi().useGetFullCollection({
    ...PREFETCH_COMPOSANTES,
    enabled: exportSubmit,
  });
  const { data: gestionnaires } = useApi().useGetFullCollection({
    path: "/roles/{roleId}/utilisateurs",
    parameters: { roleId: "/roles/ROLE_PLANIFICATEUR" },
    enabled: exportSubmit,
  });
  const { data: tags } = useApi().useGetFullCollection({
    ...PREFETCH_TAGS,
    enabled: exportSubmit,
  });

  const refDataReady = !!(composantes?.items && gestionnaires?.items && tags?.items);

  return (
    <CsvExportButton<"/beneficiaires">
      key={exportKey}
      path="/beneficiaires"
      itemsPerPage={200}
      query={{ ...filtreBeneficiaire }}
      headers={headers}
      filename="beneficiaires"
      getData={(items) =>
        getBeneficiairesData(items, composantes?.items, gestionnaires?.items, tags?.items)
      }
      ready={refDataReady}
      onStart={() => setExportState((prev) => ({ ...prev, exportSubmit: true }))}
    />
  );
}
