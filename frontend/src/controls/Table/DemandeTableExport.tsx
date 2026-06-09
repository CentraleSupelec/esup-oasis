/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {
  IComposante,
  IDemande,
  IEtatDemande,
  IProfil,
  ITypeDemande,
  PREFETCH_COMPOSANTES,
  PREFETCH_ETAT_DEMANDE,
  PREFETCH_PROFILS,
  PREFETCH_TYPES_DEMANDES,
} from "@api";
import { useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import dayjs from "dayjs";
import { FiltreDemande } from "@controls/Table/DemandeTable";
import CsvExportButton from "@controls/Table/Export/CsvExportButton";

const headers = [
  { label: "Demandeur (nom)", key: "demandeur.nom" },
  { label: "Demandeur (prénom)", key: "demandeur.prenom" },
  { label: "Composantes", key: "composantes" },
  { label: "Formations", key: "formations" },
  { label: "Type de demande", key: "typeDemande" },
  { label: "Date de dépôt", key: "dateDepot" },
  { label: "Etat de la demande", key: "etat" },
  { label: "Profil attribué", key: "profilAttribue" },
];

function getDemandesExportData(
  demandes: IDemande[],
  composantes: IComposante[] | undefined,
  etats: IEtatDemande[] | undefined,
  typesDemandes: ITypeDemande[] | undefined,
  profils: IProfil[] | undefined,
) {
  return demandes.map((demande) => {
    return {
      key: demande["@id"],
      "demandeur.nom": demande.demandeur?.nom,
      "demandeur.prenom": demande.demandeur?.prenom,
      dateDepot: demande.dateDepot ? dayjs(demande.dateDepot).format("DD/MM/YYYY") : "",
      composantes: demande.demandeur?.inscriptions
        ?.map((inscription) => inscription.formation)
        ?.map((formation) => formation?.composante)
        ?.map((composante) => {
          if (!composante) return null;
          return composantes?.find((c) => c["@id"] === composante);
        })
        .map((composante) => composante?.libelle?.replaceAll('"', '""'))
        .join(", "),
      formations: demande.demandeur?.inscriptions
        ?.map((inscription) => inscription.formation?.libelle?.replaceAll('"', '""'))
        .join(", "),
      typeDemande: typesDemandes
        ?.find((t) => t["@id"] === demande.typeDemande)
        ?.libelle?.replaceAll('"', '""'),
      etat: etats?.find((e) => e["@id"] === demande.etat)?.libelle,
      profilAttribue: profils
        ?.find((p) => p["@id"] === demande.profilAttribue)
        ?.libelle?.replaceAll('"', '""'),
    };
  });
}

export default function DemandeTableExport(props: { filtreDemande: FiltreDemande }) {
  const [{ exportKey, exportSubmit, prevFilter }, setExportState] = useState({
    exportKey: 0,
    exportSubmit: false,
    prevFilter: props.filtreDemande,
  });

  if (prevFilter !== props.filtreDemande) {
    setExportState((prev) => ({
      exportKey: prev.exportKey + 1,
      exportSubmit: false,
      prevFilter: props.filtreDemande,
    }));
  }

  const { data: composantes } = useApi().useGetFullCollection({
    ...PREFETCH_COMPOSANTES,
    enabled: exportSubmit,
  });
  const { data: etats } = useApi().useGetFullCollection({
    ...PREFETCH_ETAT_DEMANDE,
    enabled: exportSubmit,
  });
  const { data: typesDemandes } = useApi().useGetFullCollection({
    ...PREFETCH_TYPES_DEMANDES,
    enabled: exportSubmit,
  });
  const { data: profils } = useApi().useGetFullCollection({
    ...PREFETCH_PROFILS,
    enabled: exportSubmit,
  });

  const refDataReady = !!(
    composantes?.items &&
    etats?.items &&
    typesDemandes?.items &&
    profils?.items
  );

  return (
    <CsvExportButton<"/demandes">
      key={exportKey}
      path="/demandes"
      itemsPerPage={200}
      query={{ ...props.filtreDemande, format_simple: true }}
      headers={headers}
      filename="demandes"
      getData={(items) =>
        getDemandesExportData(
          items,
          composantes?.items,
          etats?.items,
          typesDemandes?.items,
          profils?.items,
        )
      }
      ready={refDataReady}
      onStart={() => setExportState((prev) => ({ ...prev, exportSubmit: true }))}
    />
  );
}
