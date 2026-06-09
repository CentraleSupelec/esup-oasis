/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { App, Button, Col, FormInstance, Row, Space } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { Evenement } from "@lib";
import EventDeleteButton from "@controls/Buttons/EventDeleteButton";
import EventCopyButton from "@controls/Buttons/EventCopyButton";

interface IEvenementModalFooterProps {
  evenement: Evenement;
  form: FormInstance;
  onDelete: () => void;
  onCancel: () => void;
}

export default function EvenementModalFooter({
  evenement,
  form,
  onDelete,
  onCancel,
}: IEvenementModalFooterProps): ReactElement {
  const { notification } = App.useApp();

  return (
    <Row>
      <Col xs={8} sm={8} lg={12} className="text-left">
        <Space>
          {evenement["@id"] && <EventDeleteButton evenement={evenement} onDelete={onDelete} />}
          <EventCopyButton
            evenement={evenement}
            onCopy={() => {
              notification.success({
                title: "Informations de l'évènement copiées dans le presse-papier",
              });
            }}
          />
        </Space>
      </Col>
      <Col xs={16} sm={16} lg={12} className="text-right">
        <Space>
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
            Enregistrer
          </Button>
        </Space>
      </Col>
    </Row>
  );
}
