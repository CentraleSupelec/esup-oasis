/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import "@routes/administration/Administration.scss";
import { Card, Col, Layout, List, Row, Typography } from "antd";
import { VERSIONS } from "@/versions";
import {
  ArrowRightOutlined,
  BugOutlined,
  HourglassOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { RoleCalculeItem } from "@controls/Items/RoleCalculeItem";
import { env } from "@/env";

/**
 * Note de version de l'application.
 *
 * @return {ReactElement} The rendered version component.
 */
export default function Version(): ReactElement {
  function getChangeIcon(type: "add" | "change" | "fix" | "remove" | "to-do" | undefined) {
    switch (type) {
      case "add":
        return <PlusOutlined className="mr-1" />;
      case "fix":
        return <BugOutlined className="mr-1" />;
      case "to-do":
        return <HourglassOutlined className="mr-1" />;
      default:
        return <MinusOutlined className="mr-1" />;
    }
  }

  return (
    <Layout.Content style={{ padding: "0 50px" }}>
      <Typography.Title level={1}>Notes de version</Typography.Title>
      <Card>
        <List className="ant-list-radius">
          {VERSIONS.sort((v1, v2) => v2.version.localeCompare(v1.version)).map(
            (version, indexVersion) => {
              const isActive =
                env.REACT_APP_VERSION === version.version ||
                (env.REACT_APP_ENVIRONMENT === "dev" && indexVersion === 0);
              return (
                <List.Item key={version.version}>
                  <List.Item.Meta
                    title={
                      <Typography.Text className="mt-0 text-primary" style={{ fontSize: 18 }}>
                        Version {version.version} - {version.description}
                      </Typography.Text>
                    }
                    description={
                      <div className="d-block w-100 mt-2">
                        {version.changes?.map((change, index) => (
                          <div key={index} className="w-100 mb-2">
                            <Row>
                              <Col
                                xs={2}
                                sm={2}
                                md={1}
                                lg={1}
                                className={`text-center ${
                                  change.type === "to-do" ? "text-light" : ""
                                }`}
                              >
                                {getChangeIcon(change.type)}
                              </Col>
                              <Col xs={22} sm={22} md={23} lg={16}>
                                <Typography.Text
                                  className={`d-block ${
                                    change.type === "to-do" ? "text-light" : ""
                                  }`}
                                >
                                  {change.description}
                                </Typography.Text>
                              </Col>
                              <Col xs={24} sm={24} md={24} lg={7} className="d-none">
                                {change.roles?.map((role, indexRole) => (
                                  <RoleCalculeItem key={indexRole} role={role} className="mb-1" />
                                ))}
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    }
                    avatar={
                      <ArrowRightOutlined
                        className={`fs-13 text-primary ${isActive ? "" : "v-hidden"}`}
                      />
                    }
                  />
                </List.Item>
              );
            },
          )}
        </List>
      </Card>
    </Layout.Content>
  );
}
