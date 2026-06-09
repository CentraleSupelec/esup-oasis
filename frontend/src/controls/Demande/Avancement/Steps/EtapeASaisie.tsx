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
import { App, Button, Flex, Typography } from "antd";
import {
  ETAT_DEMANDE_EN_COURS,
  ETAT_DEMANDE_RECEPTIONNEE,
  EtatInfo,
  getEtatDemandeInfo,
} from "@lib";
import { IDemande, QK_DEMANDES } from "@api";
import { useApi } from "@context/api/ApiProvider";
import { FONCTIONNALITES, useQuestionnaire } from "@context/demande/QuestionnaireProvider";

interface EtapeASaisieProps {
  etatDemande: EtatInfo;
  demande: IDemande;
}

export default function EtapeASaisie({ etatDemande, demande }: EtapeASaisieProps) {
  const { message } = App.useApp();
  const mutation = useApi().usePatch({
    path: demande["@id"] as "/demandes/{id}",
    invalidationQueryKeys: [QK_DEMANDES],
    onSuccess: () => {
      message.success("Demande déclarée réceptionnée");
    },
  });

  const { questUtils } = useQuestionnaire();
  if (etatDemande.ordre === getEtatDemandeInfo(ETAT_DEMANDE_EN_COURS)?.ordre)
    return (
      <Flex align="center" gap={8}>
        <Typography.Text type="secondary">La demande est en cours de saisie</Typography.Text>
        {questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.DECLARER_RECEPTIONNEE) && (
          <Button
            size="small"
            onClick={() => {
              mutation.mutate({
                "@id": demande["@id"] as string,
                data: {
                  etat: ETAT_DEMANDE_RECEPTIONNEE,
                },
              });
            }}
          >
            Déclarer réceptionnée
          </Button>
        )}
      </Flex>
    );

  return <Typography.Text>Demande réceptionnée</Typography.Text>;
}
