/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useCallback } from "react";
import dayjs from "dayjs";
import { CalendarEvenement, Evenement } from "@lib";
import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_CAMPUS, PREFETCH_TYPES_EQUIPEMENTS, PREFETCH_TYPES_EVENEMENTS } from "@api";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { UtilisateurAsString } from "@controls/Items/UtilisateurAsString";

export function useCalendarEventDescription(event: CalendarEvenement) {
  const { data: intervenant } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: event.data.intervenant as string,
    enabled: !!event.data.intervenant,
  });
  const { data: dataCampus } = useApi().useGetFullCollection(PREFETCH_CAMPUS);
  const { data: typesEvenements } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);
  const { data: equipements } = useApi().useGetFullCollection(PREFETCH_TYPES_EQUIPEMENTS);

  const getDescriptionAccessible = useCallback((): string => {
    const evenement: Evenement = event.data;
    const type = typesEvenements?.items.find((t) => t["@id"] === evenement.type);

    // Libellé
    let title = `Évènement ${evenement.libelle || type?.libelle || "sans titre"} du ${dayjs(
      evenement.debut,
    ).format("dddd DD MMMM YYYY")} de ${dayjs(evenement.debut).format("HH:mm")} à ${dayjs(
      evenement.fin,
    ).format("HH:mm")}. `;

    // Bénéficiaires
    if (evenement.beneficiaires && evenement.beneficiaires.length > 0) {
      if (evenement.beneficiaires.length === 1) {
        title += `Le bénéficiaire de cet évènement est : ${UtilisateurAsString({
          utilisateurId: evenement.beneficiaires[0],
        })}. `;
      } else {
        title += `Les bénéficiaires de cet évènement sont : ${evenement.beneficiaires
          .map((b) => {
            return UtilisateurAsString({ utilisateurId: b }) || "";
          })
          .join(", ")}. `;
      }
    } else {
      title += `Aucun bénéficiaire n'est lié à cet évènement. `;
    }

    // Intervenant
    if (evenement.type !== TYPE_EVENEMENT_RENFORT) {
      if (evenement.intervenant && intervenant) {
        title += `L'intervenant de cet évènement est ${intervenant.prenom} ${intervenant.nom}. `;
      } else {
        title += `L'intervenant de cet évènement n'a pas été défini pour le moment. `;
      }
    }

    // Enseignants
    if (evenement.enseignants && evenement.enseignants.length > 0) {
      if (evenement.enseignants.length === 1) {
        title += `L'enseignant de cet évènement est ${
          UtilisateurAsString({ utilisateurId: evenement.enseignants[0] }) || ""
        }. `;
      } else {
        title += `Les enseignants de cet évènement sont : ${evenement.enseignants
          .map((b) => {
            return UtilisateurAsString({ utilisateurId: b }) || "";
          })
          .join(", ")}. `;
      }
    } else {
      title += `Aucun enseignant n'est lié à cet évènement. `;
    }

    // Localisation
    if (evenement.campus && dataCampus) {
      title += `L'évènement se déroulera sur le campus ${
        dataCampus.items.find((c) => c["@id"] === evenement.campus)?.libelle
      }, salle ${evenement.salle || "non définie pour le moment"}. `;
    }

    // Equipements
    if (evenement.equipements && evenement.equipements.length > 0 && equipements) {
      title += `Les aménagements suivants sont liés à l'évènement : ${evenement.equipements
        .map((e) => equipements.items.find((eq) => eq["@id"] === e)?.libelle)
        .join(", ")}. `;
    }

    return title;
  }, [event.data, intervenant, dataCampus, typesEvenements, equipements]);

  return { getDescriptionAccessible };
}
