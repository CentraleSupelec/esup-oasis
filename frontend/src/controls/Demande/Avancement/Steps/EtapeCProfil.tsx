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
import { Typography } from "antd";
import {
  ETAT_DEMANDE_ATTENTE_COMMISSION,
  ETAT_DEMANDE_CONFORME,
  ETAT_DEMANDE_REFUSEE,
  EtatInfo,
} from "@lib";
import { IDemande } from "@api";
import { useApi } from "@context/api/ApiProvider";
import { FONCTIONNALITES, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { useAuth } from "@/auth/AuthProvider";
import ProfilsSelectButton from "@controls/Demande/Avancement/ProfilsSelectButton";
import { DemandeProfilAttribue } from "@controls/Demande/Avancement/AvancementDemande";

interface EtapeCProfilProps {
  etatDemande: EtatInfo;
  demande: IDemande;
}

export default function EtapeCProfil({ etatDemande, demande }: EtapeCProfilProps) {
  const { questUtils } = useQuestionnaire();
  const { user } = useAuth();
  const { data: membreCommission } = useApi().useGetItem({
    path: "/commissions/{commissionId}/membres/{uid}",
    url: `/commissions/${demande.idCommission}/membres/${user?.uid}`,
    enabled:
      demande.idCommission !== undefined && user?.uid !== undefined && user.isCommissionMembre,
  });

  if (etatDemande.id === ETAT_DEMANDE_CONFORME) {
    if (
      !questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.ATTRIBUER_PROFIL, membreCommission?.roles)
    ) {
      return <>En attente profil</>;
    }

    return (
      <>
        {questUtils?.isGrantedQuestionnaire(
          FONCTIONNALITES.ATTRIBUER_PROFIL,
          membreCommission?.roles,
        ) && <ProfilsSelectButton demande={demande} masquerCommission={false} />}
      </>
    );
  }

  if (etatDemande.etape < "C") return null;

  if (etatDemande.id === ETAT_DEMANDE_REFUSEE) {
    return <Typography.Text type="danger">Demande refusée</Typography.Text>;
  }

  if (etatDemande.id === ETAT_DEMANDE_ATTENTE_COMMISSION) {
    return (
      <>
        <Typography.Text type="warning">Attente commission</Typography.Text>{" "}
        <>
          {questUtils?.isGrantedQuestionnaire(
            FONCTIONNALITES.ATTRIBUER_PROFIL,
            membreCommission?.roles,
          ) && <ProfilsSelectButton demande={demande} masquerCommission={true} />}
        </>
      </>
    );
  }

  return (
    <>
      <Typography.Text>Profil attribué</Typography.Text>
      <DemandeProfilAttribue demandeId={demande["@id"] as string} />
    </>
  );
}
