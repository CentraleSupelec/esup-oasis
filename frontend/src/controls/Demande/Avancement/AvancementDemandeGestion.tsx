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
import { Steps, Typography } from "antd";
import {
  ETAT_ATTENTE_CHARTES,
  ETAT_DEMANDE_ATTENTE_COMMISSION,
  ETAT_DEMANDE_NON_CONFORME,
} from "@lib";
import "@controls/Demande/Avancement/AvancementDemande.scss";
import { useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { DerniereModifDemandeLabel } from "@controls/Avatars/DerniereModifDemandeLabel";
import { RefsTourDemande } from "@routes/gestionnaire/demandeurs/Demande";
import EtapeASaisie from "@controls/Demande/Avancement/Steps/EtapeASaisie";
import EtapeBConformite from "@controls/Demande/Avancement/Steps/EtapeBConformite";
import EtapeCProfil from "@controls/Demande/Avancement/Steps/EtapeCProfil";
import EtapeDAccompagnement from "@controls/Demande/Avancement/Steps/EtapeDAccompagnement";
import { useAvancementSteps } from "@controls/Demande/Avancement/useAvancementSteps";

export default function AvancementDemandeGestion(props: {
  refs?: RefsTourDemande;
}): React.ReactElement {
  const { demande, etatDemande, typeDemande, campagne } = useQuestionnaire();
  const { calculerEtatStep } = useAvancementSteps(demande, etatDemande);

  if (!demande) return <>Demande inconnue</>;
  if (!etatDemande) return <>Etat de la demande inconnu</>;

  return (
    <div ref={props.refs?.avancement}>
      <Steps
        className="stepper-gestionnaire"
        items={
          [
            {
              title: "Saisie",
              status: calculerEtatStep("A"),
              content: <EtapeASaisie etatDemande={etatDemande} demande={demande} />,
            },
            {
              title: "Conformité",
              status: calculerEtatStep("B"),
              content: <EtapeBConformite demande={demande} etatDemande={etatDemande} />,
            },
            ((typeDemande?.profilsCibles || []).length > 1 || campagne?.commission) && {
              title: "Profil",
              status: etatDemande.etape >= "C" ? "finish" : "wait",
              content: <EtapeCProfil demande={demande} etatDemande={etatDemande} />,
            },
            demande.etat === ETAT_ATTENTE_CHARTES && {
              title: "Charte(s)",
              status: "process",
              content: <>Attente validation charte(s)</>,
            },
            {
              title: "Accompagnement",
              status: calculerEtatStep("D"),
              content: <EtapeDAccompagnement demande={demande} etatDemande={etatDemande} />,
            },
          ].filter((step) => step) as []
        }
      ></Steps>

      {(etatDemande.id === ETAT_DEMANDE_NON_CONFORME ||
        etatDemande.id === ETAT_DEMANDE_ATTENTE_COMMISSION) && (
        <DerniereModifDemandeLabel
          asAlert
          demandeId={demande?.["@id"]}
          classNameValue="semi-bold"
          title=""
          ifEmpty={<Typography.Text type="secondary">Aucun complément</Typography.Text>}
        />
      )}
    </div>
  );
}
