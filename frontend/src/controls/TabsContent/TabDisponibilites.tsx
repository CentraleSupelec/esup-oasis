/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Alert, Button, Col, DatePicker, Divider, Form, Popconfirm, Row, Space } from "antd";
import React, { ReactElement, useState } from "react";
import { InfoCircleFilled, SaveOutlined, WarningFilled } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { RoleValues, Utilisateur } from "@lib";
import dayjs from "dayjs";
import { createDateAsUTC } from "@utils/dates";
import { IUtilisateur, QK_INTERVENANTS, QK_UTILISATEURS } from "@api";

interface ITabDisponibilitesProps {
  utilisateur: IUtilisateur;
  setUtilisateur: (utilisateur: Utilisateur) => void;
  onArchive?: () => void;
}

/**
 * Updates the availability of an intervenant and allows for archiving the intervenant.
 *
 * @param {ITabDisponibilitesProps} props - The props object containing the necessary data.
 * @param {IUtilisateur} props.utilisateur - The utilisateur object to update.
 * @param {function} props.setUtilisateur - The function to set the updated utilisateur object.
 * @param {function} [props.onArchive] - The function to be called when the intervenant is archived.
 *
 * @returns {ReactElement} - The JSX element representing the tab for managing intervenant availability and archiving.
 */
export function TabDisponibilites({
  utilisateur,
  setUtilisateur,
  onArchive,
}: ITabDisponibilitesProps): ReactElement {
  const [submit, setSubmit] = useState(false);
  const mutation = useApi().usePatch({
    path: "/utilisateurs/{uid}",
    invalidationQueryKeys: [QK_UTILISATEURS, QK_INTERVENANTS],
    onSuccess: () => {
      onArchive?.();
    },
  });
  const estArchive = !utilisateur?.roles?.includes(RoleValues.ROLE_INTERVENANT);

  return (
    <>
      {estArchive && (
        <Alert
          type="warning"
          icon={<WarningFilled />}
          showIcon
          title="Intervenant archivé"
          description={
            <p>
              Un intervenant archivé ne peut plus être affecté à des nouveaux évènements.
              <br />
              Pour le réactiver, prolongez la période de validité.
            </p>
          }
        />
      )}
      <Divider>Période de validité</Divider>
      <p>L'intervenant est actuellement engagé avec l'établissement sur la période :</p>
      <Row>
        <Col xs={24} sm={24} md={2} className="d-flex-center">
          du
        </Col>
        <Col xs={24} sm={24} md={9}>
          <Form.Item
            name="intervenantDebut"
            rules={[{ required: utilisateur?.roles?.includes(RoleValues.ROLE_INTERVENANT) }]}
            getValueProps={(i) => ({ value: i ? dayjs(i) : undefined })}
            required
          >
            <DatePicker
              className="w-100 text-center"
              format="DD/MM/YYYY"
              value={utilisateur.intervenantDebut ? dayjs(utilisateur.intervenantDebut) : null}
              onChange={(date) => {
                setUtilisateur(
                  new Utilisateur({
                    ...utilisateur,
                    intervenantDebut: date ? createDateAsUTC(date?.toDate()).toISOString() : null,
                  }),
                );
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={3} className="d-flex-center">
          au
        </Col>
        <Col xs={24} sm={24} md={9}>
          <Form.Item
            name="intervenantFin"
            rules={[{ required: utilisateur?.roles?.includes(RoleValues.ROLE_INTERVENANT) }]}
            getValueProps={(i) => ({ value: i ? dayjs(i) : undefined })}
            required
          >
            <DatePicker
              className="w-100 text-center"
              format="DD/MM/YYYY"
              value={utilisateur.intervenantFin ? dayjs(utilisateur.intervenantFin) : null}
              onChange={(date) => {
                setUtilisateur(
                  new Utilisateur({
                    ...utilisateur,
                    intervenantFin: date ? createDateAsUTC(date?.toDate()).toISOString() : null,
                  }),
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Space className="legende mb-2">
        <InfoCircleFilled />
        <span>Passé cette date, l'intervenant sera automatiquement archivé.</span>
      </Space>
      <Row className="mb-3">
        <Col span={24}>
          <Form.Item className="text-center">
            <Button
              htmlType="submit"
              type="primary"
              icon={<SaveOutlined />}
              loading={submit}
              onClick={() => {
                setSubmit(true);
              }}
            >
              Enregistrer
            </Button>
          </Form.Item>
        </Col>
      </Row>

      {!estArchive && (
        <>
          <Divider>Archivage</Divider>
          <Alert
            type="warning"
            icon={<WarningFilled />}
            showIcon
            title="Archivage de l'intervenant"
            description="Un intervenant archivé ne peut plus être affecté à des nouveaux évènements."
          />
          <div className="text-center">
            <Popconfirm
              title="Êtes-vous sûr de vouloir archiver cet intervenant ?"
              okText="Oui"
              cancelText="Non"
              onConfirm={() => {
                mutation.mutate({
                  data: {
                    roles: utilisateur.roles?.filter((r) => r !== RoleValues.ROLE_INTERVENANT),
                  },
                  "@id": utilisateur["@id"] as string,
                });
              }}
            >
              <Button type="primary" danger className="mt-2" disabled={estArchive}>
                Archiver
              </Button>
            </Popconfirm>
          </div>
        </>
      )}
    </>
  );
}
