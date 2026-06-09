/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Popconfirm, Space } from "antd";
import React from "react";
import { ETAT_DEMANDE_REFUSEE, ETAT_DEMANDE_VALIDEE } from "@lib";
import { useApi } from "@context/api/ApiProvider";
import { IDemande, QK_BENEFICIAIRES, QK_DEMANDES } from "@api";
import { DownOutlined } from "@ant-design/icons";

export default function ValidationAccompagnementButton(props: {
  demande: IDemande;
}): React.ReactElement {
  const { message } = App.useApp();
  const mutation = useApi().usePatch({
    path: props.demande["@id"] as "/demandes/{id}",
    invalidationQueryKeys: [
      QK_DEMANDES,
      props.demande["@id"] as string,
      QK_BENEFICIAIRES,
      props.demande.demandeur?.["@id"] as string,
    ],
    onSuccess: () => {
      message.success("Accompagnement mis à jour").then();
    },
  });

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "valider",
            label: "Créer bénéficiaire",
            onClick: () => {
              mutation.mutate({
                "@id": props.demande["@id"] as string,
                data: {
                  etat: ETAT_DEMANDE_VALIDEE,
                },
              });
            },
          },
          {
            key: "divider",
            type: "divider",
          },
          {
            key: "refuser",
            label: (
              <Popconfirm
                title="Refuser la demande ?"
                okText="Oui, refuser"
                okType="danger"
                cancelText="Non"
                onConfirm={() => {
                  mutation.mutate({
                    "@id": props.demande["@id"] as string,
                    data: {
                      etat: ETAT_DEMANDE_REFUSEE,
                    },
                  });
                }}
              >
                Refuser la demande
              </Popconfirm>
            ),
            danger: true,
          },
        ],
      }}
    >
      <Button type="link" size="small">
        <Space>
          <span>Choisir</span>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}
