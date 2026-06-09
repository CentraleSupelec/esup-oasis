/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Input, MenuProps, Modal, Space } from "antd";
import { CaretDownOutlined, CloseOutlined } from "@ant-design/icons";
import React from "react";
import {
  ETAT_DEMANDE_ATTENTE_COMMISSION,
  ETAT_DEMANDE_PROFIL_ACCEPTE,
  ETAT_DEMANDE_REFUSEE,
} from "@lib";
import { useApi } from "@context/api/ApiProvider";
import { IDemande, PREFETCH_PROFILS, QK_DEMANDES } from "@api";
import { useQuestionnaire } from "@context/demande/QuestionnaireProvider";

export default function ProfilsSelectButton(props: {
  demande: IDemande;
  masquerCommission: boolean;
}): React.ReactElement {
  const { typeDemande, campagne } = useQuestionnaire();
  const { message } = App.useApp();
  const [modaleRefusOpen, setModaleRefusOpen] = React.useState<boolean>(false);
  const [modaleCommissionOpen, setModaleCommissionOpen] = React.useState<boolean>(false);
  const [profil, setProfil] = React.useState<string>();
  const [commentaire, setCommentaire] = React.useState<string>("");
  const { data: profils } = useApi().useGetFullCollection(PREFETCH_PROFILS);

  const mutation = useApi().usePatch({
    path: props.demande["@id"] as "/demandes/{id}",
    invalidationQueryKeys: [QK_DEMANDES],
    onSuccess: () => {
      message.success("Demande mise à jour").then();
    },
  });

  function sendToApi(etat: string, profilAttribue?: string, comment?: string) {
    mutation.mutate({
      "@id": props.demande["@id"] as string,
      data: {
        etat,
        commentaireChangementEtat: comment,
        profilAttribue,
      },
    });
  }

  const menu: MenuProps["items"] = [
    (typeDemande?.profilsCibles || []).length > 0
      ? {
          type: "group",
          label: "Attribuer un profil",
          key: "profils",
          children: (typeDemande?.profilsCibles || []).map((p) => ({
            label: profils?.items.find((pr) => pr["@id"] === p)?.libelle || "",
            key: p,
            onClick: () => {
              setProfil(p);
            },
          })),
        }
      : null,
    (typeDemande?.profilsCibles || []).length > 0
      ? {
          type: "divider",
          key: "divider-commission",
        }
      : null,
    campagne?.commission && !props.masquerCommission
      ? {
          label: "Transmettre à la commission",
          key: "commission",
          onClick: () => {
            setModaleCommissionOpen(true);
          },
        }
      : null,
    campagne?.commission && !props.masquerCommission
      ? {
          type: "divider",
          key: "divider-refus",
        }
      : null,
    {
      label: "Refuser la demande",
      key: "refuser",
      icon: <CloseOutlined />,
      className: "text-danger",
      onClick: () => {
        setModaleRefusOpen(true);
      },
    },
  ];

  return (
    <>
      <Modal
        open={profil !== undefined}
        title="Attribuer un profil"
        onCancel={() => setProfil(undefined)}
        okText="Oui"
        cancelText="Non"
        onOk={() => {
          if (profil) {
            sendToApi(ETAT_DEMANDE_PROFIL_ACCEPTE, profil);
          }
        }}
      >
        {profil && (
          <>
            Êtes-vous sûr de vouloir attribuer le profil{" "}
            <b style={{ color: "var(--color-primary)" }}>
              {profils?.items.find((pr) => pr["@id"] === profil)?.libelle}
            </b>
            &nbsp;?
          </>
        )}
      </Modal>
      <Modal
        open={modaleCommissionOpen}
        title="Transmettre à la commission"
        onCancel={() => setModaleCommissionOpen(false)}
        okText="Oui, transmettre"
        cancelText="Non"
        onOk={() => {
          sendToApi(ETAT_DEMANDE_ATTENTE_COMMISSION, undefined, commentaire);
        }}
      >
        <p>Êtes-vous sûr de vouloir transmettre la demande à la commission &nbsp;?</p>
        <p>Vous pouvez, si vous le souhaitez, indiquer un commentaire à la commission&nbsp;:</p>
        <Input.TextArea
          value={commentaire}
          onChange={(e) => {
            setCommentaire(() => e.target.value as string);
          }}
          autoSize
          autoFocus
          style={{ width: "100%", minHeight: 100 }}
          placeholder="Commentaire à la commission"
          className="mt-0"
        />
      </Modal>
      <Modal
        open={modaleRefusOpen}
        onCancel={() => setModaleRefusOpen(false)}
        title="Refuser la demande"
        okText="Refuser"
        okButtonProps={{ danger: true }}
        cancelText="Annuler"
        onOk={() => {
          if (commentaire) {
            sendToApi(ETAT_DEMANDE_REFUSEE, undefined, commentaire);
          }
        }}
      >
        <p>
          Vous allez refuser la demande de profil, merci de saisir un motif qui sera affiché au
          demandeur&nbsp;:
        </p>
        <Input.TextArea
          value={commentaire}
          onChange={(e) => {
            setCommentaire(() => e.target.value as string);
          }}
          autoSize
          autoFocus
          style={{ width: "100%", minHeight: 100 }}
          placeholder="Raison de refus"
          className="mt-1"
        />
      </Modal>
      <Dropdown menu={{ items: menu }}>
        <Button type="link" size="small" className="p-0">
          <Space size="small">
            Choisir
            <CaretDownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  );
}
