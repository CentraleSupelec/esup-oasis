/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Popconfirm, Space, Tooltip } from "antd";
import { useApi } from "@context/api/ApiProvider";
import {
  CheckCircleFilled,
  EyeOutlined,
  FileDoneOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import React from "react";
import { useAuth } from "@/auth/AuthProvider";
import { QK_BENEFICIAIRES, QK_UTILISATEURS_DECISIONS, QK_UTILISATEURS_ITEM } from "@api";
import apiDownloader from "@utils/apiDownloader";
import { EtatDecisionEtablissement } from "@controls/Avatars/DecisionEtablissementAvatar";
import { queryClient } from "@/queryClient";
import { env } from "@/env";

export function BoutonDecisionEtab(props: { utilisateurId: string }) {
  const auth = useAuth();
  const [loading, setLoading] = React.useState<boolean>(false);
  const { message } = App.useApp();
  const { data: utilisateur } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: props.utilisateurId,
    enabled: !!props.utilisateurId,
  });

  const mutateDecisionEtab = useApi().usePatch({
    path: "/utilisateurs/{uid}/decisions/{annee}",
    invalidationQueryKeys: [
      QK_BENEFICIAIRES,
      QK_UTILISATEURS_ITEM,
      QK_UTILISATEURS_DECISIONS,
      props.utilisateurId,
    ],
    onSuccess: (data) => {
      setLoading(false);
      if (data.etat === EtatDecisionEtablissement.EDITE) {
        message.success("Décision d'établissement envoyée").then();
      } else if (data.etat === EtatDecisionEtablissement.VALIDE) {
        message.success("Demande d'édition de la décision d'établissement envoyée").then();
      }
    },
    onError: () => {
      setLoading(false);
      message.error("Erreur lors du traitement de la décision d'établissement").then();
    },
  });

  if (!utilisateur || !utilisateur.decisionAmenagementAnneeEnCours) {
    return <></>;
  }

  switch (utilisateur.decisionAmenagementAnneeEnCours.etat) {
    case EtatDecisionEtablissement.ATTENTE_VALIDATION_CAS:
      return (
        <Tooltip title="En attente validation CAS">
          <Dropdown
            menu={{
              items: [
                {
                  key: "apercu",
                  icon: <EyeOutlined />,
                  label: "Aperçu de la décision",
                  onClick: () => {
                    setLoading(true);
                    apiDownloader(
                      `${env.REACT_APP_API}${utilisateur.decisionAmenagementAnneeEnCours?.["@id"]}`,
                      auth,
                      {
                        Accept: "application/pdf",
                      },
                      `${env.REACT_APP_TITRE?.toLocaleUpperCase()}_DecisionEtablissement.pdf`,
                      () => setLoading(false),
                      () => setLoading(false),
                    ).then();
                  },
                },
                {
                  type: "divider",
                  key: "divider",
                },
                {
                  key: "send",
                  icon: <SendOutlined />,
                  label: (
                    <Popconfirm
                      title={
                        auth.user?.isAdmin
                          ? "Envoyer la décision d'établissement ?"
                          : "Demander l'édition de la décision d'établissement ?"
                      }
                      onConfirm={() => {
                        setLoading(true);
                        mutateDecisionEtab.mutate({
                          data: {
                            etat: auth.user?.isAdmin
                              ? EtatDecisionEtablissement.EDITION_DEMANDEE
                              : EtatDecisionEtablissement.VALIDE,
                          },
                          "@id": utilisateur.decisionAmenagementAnneeEnCours?.["@id"] as string,
                        });
                      }}
                    >
                      <Button loading={loading} type="text" className="p-0 m-0 no-hover">
                        {auth.user?.isAdmin
                          ? "Envoyer la décision étab."
                          : "Demander l'édition décision étab."}
                      </Button>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button
              loading={loading}
              icon={<FileDoneOutlined />}
              className="text-warning border-orange mr-2"
            >
              Décision d'étab. en attente
            </Button>
          </Dropdown>
        </Tooltip>
      );

    case EtatDecisionEtablissement.VALIDE:
      return (
        <Dropdown
          menu={{
            items: [
              {
                key: "apercu",
                icon: <EyeOutlined />,
                label: "Aperçu de la décision",
                onClick: () => {
                  setLoading(true);
                  apiDownloader(
                    `${env.REACT_APP_API}${utilisateur.decisionAmenagementAnneeEnCours?.["@id"]}`,
                    auth,
                    {
                      Accept: "application/pdf",
                    },
                    `${env.REACT_APP_TITRE?.toLocaleUpperCase()}_DecisionEtablissement.pdf`,
                    () => setLoading(false),
                    () => setLoading(false),
                  ).then();
                },
              },
              auth.user?.isAdmin
                ? {
                    type: "divider",
                    key: "divider",
                  }
                : null,
              auth.user?.isAdmin
                ? {
                    key: "send",
                    icon: <SendOutlined />,
                    label: "Envoyer la décision",
                    onClick: () => {
                      setLoading(true);
                      mutateDecisionEtab.mutate({
                        data: {
                          etat: EtatDecisionEtablissement.EDITION_DEMANDEE,
                        },
                        "@id": utilisateur.decisionAmenagementAnneeEnCours?.["@id"] as string,
                      });
                    },
                  }
                : null,
            ],
          }}
        >
          <Button disabled loading={loading} icon={<FileDoneOutlined />} className="mr-2">
            {auth.user?.isAdmin ? "Éditer décision étab." : "Décision d'étab. demandée"}
          </Button>
        </Dropdown>
      );

    case EtatDecisionEtablissement.EDITION_DEMANDEE:
      return (
        <Space orientation="vertical" size={0}>
          <Button
            loading={loading}
            icon={<FileDoneOutlined />}
            className="mr-2"
            onClick={() => {
              setLoading(true);
              apiDownloader(
                `${env.REACT_APP_API}${utilisateur.decisionAmenagementAnneeEnCours?.["@id"]}`,
                auth,
                {
                  Accept: "application/pdf",
                },
                `${env.REACT_APP_TITRE?.toLocaleUpperCase()}_DecisionEtablissement.pdf`,
                () => setLoading(false),
                () => setLoading(false),
              ).then();
            }}
          >
            Décision d'étab. en cours d'envoi
          </Button>
          <Space className="legende">
            <div>La décision sera envoyée dans les prochaines minutes.</div>
            <Tooltip title="Rafraîchir" placement="bottom">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                type="link"
                className="m-0"
                onClick={() => {
                  queryClient
                    .invalidateQueries({
                      queryKey: [props.utilisateurId],
                    })
                    .then();
                }}
              />
            </Tooltip>
          </Space>
        </Space>
      );

    case EtatDecisionEtablissement.EDITE:
      return (
        <Tooltip title="Décision d'établissement envoyée">
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              apiDownloader(
                `${env.REACT_APP_API}${utilisateur.decisionAmenagementAnneeEnCours?.["@id"]}`,
                auth,
                {
                  Accept: "application/pdf",
                },
                `${env.REACT_APP_TITRE?.toLocaleUpperCase()}_DecisionEtablissement.pdf`,
                () => setLoading(false),
                () => setLoading(false),
              ).then();
            }}
            icon={<CheckCircleFilled />}
            className={`mr-2 ${EtatDecisionEtablissement.EDITE ? "text-success border-green-light" : ""}`}
          >
            Décision étab. envoyée
          </Button>
        </Tooltip>
      );

    default:
      return <></>;
  }
}
