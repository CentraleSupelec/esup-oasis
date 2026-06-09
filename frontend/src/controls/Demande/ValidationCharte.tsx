/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IDemande, QK_DEMANDES, QK_UTILISATEURS_CHARTES } from "@api";
import { App, Button, Card, Checkbox, Form } from "antd";
import React from "react";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { sanitizeHtml } from "@utils/sanitize";

export function ValidationCharte(props: { demande: IDemande }) {
  const { message } = App.useApp();
  const { data: chartes } = useApi().useGetFullCollection({
    path: "/utilisateurs/{uid}/chartes",
    parameters: {
      uid: props.demande.demandeur?.["@id"] as string,
    },
  });
  const mutationAccepterCharte = useApi().usePatch({
    path: `/utilisateurs/{uid}/chartes/{id}`,
    invalidationQueryKeys: [QK_UTILISATEURS_CHARTES, QK_DEMANDES],
    onSuccess: () => {
      message.success("La charte a bien été acceptée.").then();
    },
  });

  const chartesUtilisateurDemande = chartes?.items.filter(
    (c) => c.demande === props.demande["@id"],
  );

  if (!chartesUtilisateurDemande) return <Spinner />;

  return chartesUtilisateurDemande.map((charte) => (
    <Card key={charte["@id"]}>
      <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(charte.contenu as string) }} />
      <Form
        onFinish={(values) => {
          // noinspection JSUnresolvedReference
          if (values.accepter) {
            mutationAccepterCharte.mutate({
              "@id": charte["@id"] as string,
              data: { dateValidation: new Date().toISOString() },
            });
          }
        }}
      >
        <Form.Item
          name="accepter"
          valuePropName="checked"
          required
          rules={[
            {
              required: true,
              message: "Vous devez accepter la charte pour poursuivre.",
            },
          ]}
        >
          <Checkbox className="semi-bold">
            J'atteste avoir lu la charte ci-dessus et m'engage à respecter les informations qui y
            sont contenues.
          </Checkbox>
        </Form.Item>
        <Form.Item name="submit">
          <Button type="primary" htmlType="submit">
            Accepter la charte
          </Button>
        </Form.Item>
      </Form>
    </Card>
  ));
}
