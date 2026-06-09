/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { RoleApi, Utilisateur } from "@lib";
import React, { ReactElement } from "react";
import { Checkbox, Col, Form, Typography } from "antd";
import EtudiantDashboardImage from "@controls/Images/EtudiantNotificationImage";

export type NotificationFrequence = {
  key: string;
  label: string;
  roles: string[];
  visible: boolean;
};

/**
 * Array of objects representing notification frequencies.
 *
 * @type {NotificationFrequence[]}
 */
export const notificationFrequences: NotificationFrequence[] = [
  {
    key: "abonneImmediat",
    label: "Immédiatement, dès qu'un évènement vous est affecté",
    roles: ["ROLE_INTERVENANT"],
    visible: false,
  },
  {
    key: "abonneVeille",
    label: "La veille, avec les évènements du lendemain",
    roles: ["ROLE_INTERVENANT"],
    visible: false,
  },
  {
    key: "abonneAvantVeille",
    label: "2 jours avant, avec les évènements dans 2 jours",
    roles: ["ROLE_INTERVENANT"],
    visible: false,
  },
  {
    key: "abonneRecapHebdo",
    label: "Le dimanche soir, avec les évènements de la semaine",
    roles: ["ROLE_INTERVENANT", "ROLE_BENEFICIAIRE"],
    visible: true,
  },
];

/**
 * Renders the notification section of the user profile.
 *
 * @returns {ReactElement} The component that renders the user's notification preferences.
 */
export function MonProfilNotification(props: { user: Utilisateur | undefined }): ReactElement {
  return (
    <>
      <Col lg={12} xs={24}>
        <Typography.Title level={2}>Préférences de notification</Typography.Title>
        <div>
          <Form.Item
            name="notifications"
            label={<span className="semi-bold mb-1">Recevoir une notification</span>}
          >
            <Checkbox.Group className="checkbox-group-vertical">
              {notificationFrequences
                .filter((freq) => freq.visible)
                .filter((freq) =>
                  freq.roles.some((role) => props.user?.roles?.includes(role as RoleApi)),
                )
                .map((freq) => (
                  <Checkbox key={freq.key} value={freq.key}>
                    {freq.label}
                  </Checkbox>
                ))}
            </Checkbox.Group>
          </Form.Item>
        </div>
      </Col>
      <Col lg={12} sm={0} xs={0} className="text-center">
        <EtudiantDashboardImage className="mt-4" style={{ width: "100%", maxHeight: 380 }} />
      </Col>
    </>
  );
}
