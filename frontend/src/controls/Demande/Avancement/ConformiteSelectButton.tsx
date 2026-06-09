/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Input, MenuProps, Modal, Space } from "antd";
import { CaretDownOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import React from "react";
import { ETAT_DEMANDE_CONFORME, ETAT_DEMANDE_NON_CONFORME } from "@lib";
import { useApi } from "@context/api/ApiProvider";
import { IDemande, QK_DEMANDES } from "@api";

export default function ConformiteSelectButton(props: { demande: IDemande }): React.ReactElement {
  const { message } = App.useApp();
  const [conforme, setConforme] = React.useState<boolean>();
  const [commentaire, setCommentaire] = React.useState<string>("");

  const mutation = useApi().usePatch({
    path: props.demande["@id"] as "/demandes/{id}",
    invalidationQueryKeys: [QK_DEMANDES],
    onSuccess: () => {
      message.success("Conformité mise à jour").then();
    },
  });

  const menu: MenuProps["items"] = [
    {
      label: "Demande conforme",
      key: "conforme",
      icon: <CheckOutlined />,
      className: "text-success",
      onClick: () => {
        setConforme(true);
      },
    },
    {
      label: "Demande non conforme",
      key: "non-conforme",
      icon: <CloseOutlined />,
      className: "text-danger",
      onClick: () => {
        setConforme(false);
      },
    },
  ];

  return (
    <>
      <Modal
        open={conforme !== undefined}
        onCancel={() => setConforme(undefined)}
        onOk={() => {
          function sendToApi(etat: string, comment: string) {
            mutation.mutate({
              "@id": props.demande["@id"] as string,
              data: {
                etat,
                commentaireChangementEtat: comment,
              },
            });
          }

          if (conforme) {
            sendToApi(ETAT_DEMANDE_CONFORME, "");
          } else if (commentaire) {
            sendToApi(ETAT_DEMANDE_NON_CONFORME, commentaire);
          }
        }}
      >
        <>
          Êtes-vous sûr de déclarer la demande{" "}
          <b style={{ color: conforme ? "var(--color-success)" : "var(--color-danger)" }}>
            {conforme ? "conforme" : "non conforme"}
          </b>
          &nbsp;?
          {!conforme && (
            <Input.TextArea
              value={commentaire}
              onChange={(e) => {
                setCommentaire(() => e.target.value as string);
              }}
              autoSize
              autoFocus
              style={{ width: "100%", minHeight: 100 }}
              placeholder="Raison de la non-conformité"
              className="mt-1"
            />
          )}
        </>
      </Modal>
      <Dropdown menu={{ items: menu }}>
        <Button type="link" size="small" className="p-0">
          <Space size="small">
            Déclarer la conformité
            <CaretDownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  );
}
