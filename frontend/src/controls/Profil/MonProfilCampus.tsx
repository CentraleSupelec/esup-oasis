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
import { ICampus } from "@api";

/**
 * Render the campus section of the user profile
 *
 * @param {Object} props - The properties passed to the component
 * @param {Utilisateur | undefined} props.user - The user object containing the user information
 * @param {ICampus[]} props.campuses - The array of campuses to be displayed
 * @returns {ReactElement} - The rendered campus section of the user profile
 */
export function MonProfilCampus(props: {
  user: Utilisateur | undefined;
  campuses: ICampus[];
}): ReactElement {
  return (
    <>
      <Col span={24}>
        <Typography.Title level={2}>Campus</Typography.Title>
        <div>
          <Form.Item
            name="campus"
            label={
              <span className="semi-bold mb-1">
                {props.user?.isIntervenant
                  ? "Campus sur lesquels vous pouvez intervenir"
                  : "Campus que vous fréquentez"}
              </span>
            }
          >
            <Checkbox.Group
              className="checkbox-group-vertical"
              options={(props.campuses || [])
                .filter((campus) => campus.actif)
                .sort((a, b) => a.libelle.localeCompare(b.libelle))
                .map((campus) => ({
                  label: campus.libelle,
                  value: campus["@id"] as string,
                }))}
            />
          </Form.Item>
        </div>
      </Col>
    </>
  );
}
