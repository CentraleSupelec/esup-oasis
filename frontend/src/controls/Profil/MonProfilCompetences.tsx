/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Utilisateur } from "@lib";
import React, { ReactElement } from "react";
import { Checkbox, Col, Form, Typography } from "antd";
import { ICompetence } from "@api";

/**
 * Render the competences section of the user profile
 *
 * @param {Object} props - The props object.
 * @param {ICompetence[]} props.competences - The list of competences.
 * @param {Utilisateur|undefined} props.user - The user object.
 *
 * @return {ReactElement} The rendered profile competences component.
 */
export function MonProfilCompetences(props: {
  competences: ICompetence[];
  user: Utilisateur | undefined;
}): ReactElement {
  return (
    <>
      {props.user?.isIntervenant && (
        <Col span={24}>
          <Typography.Title level={2}>Compétences</Typography.Title>
          <div>
            <Form.Item
              name="competences"
              label={
                <span className="semi-bold mb-1">
                  Vos compétences pouvant être utiles lors des interventions
                </span>
              }
            >
              <Checkbox.Group
                className="checkbox-group-vertical"
                options={(props.competences || [])
                  .filter((comp) => comp.actif)
                  .sort((a, b) => a.libelle.localeCompare(b.libelle))
                  .map((comp) => ({
                    label: comp.libelle,
                    value: comp["@id"] as string,
                  }))}
              />
            </Form.Item>
          </div>
        </Col>
      )}
    </>
  );
}
