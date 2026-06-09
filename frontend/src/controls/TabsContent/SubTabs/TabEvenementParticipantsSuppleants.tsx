/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { Button, Form, Space, Tooltip } from "antd";
import UtilisateurFormItemSelect from "@controls/Forms/UtilisateurFormItemSelect";
import { Evenement, RoleValues } from "@lib";
import { ArrowUpOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import React, { ReactElement } from "react";
import { IPartialEvenement } from "@api";

interface TabEvenementParticipantsSuppleantsProps {
  evenement: Evenement | undefined;
  setEvenement: (data: IPartialEvenement | undefined, forceResetForm: boolean) => void;
}

/**
 * Renders a list of participants suppléants for an event.
 * @param {object} props - The component properties.
 * @param {object} [props.evenement] - The event object.
 * @param {function} props.setEvenement - The function to update the event object.
 * @returns {ReactElement | null} The rendered component.
 */
export function TabEvenementParticipantsSuppleants({
  evenement,
  setEvenement,
}: TabEvenementParticipantsSuppleantsProps): ReactElement | null {
  if (evenement?.type === TYPE_EVENEMENT_RENFORT) {
    // les événements de type renfort n'ont pas de suppléants
    return null;
  }

  return (
    <>
      <div className="ant-form-item mt-4">
        <Form.List name="suppleants">
          {(fields, { add }, { errors }) => (
            <>
              <div className="semi-bold">Suppléants</div>
              {fields.map(({ key, ...field }) => (
                <Form.Item className="mb-0" required={false} key={evenement?.suppleants?.at(key)}>
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Un suppléant est requis ou supprimez ce champ.",
                      },
                    ]}
                    noStyle
                  >
                    <UtilisateurFormItemSelect
                      style={{ width: "calc(100% - 75px)" }}
                      onSelect={(value) => {
                        if (value) {
                          setEvenement(
                            {
                              suppleants: [
                                ...(evenement?.suppleants || []).filter(
                                  (b) => b !== value && b !== undefined,
                                ),
                                value,
                              ],
                            },
                            true,
                          );
                        } else {
                          setEvenement(
                            {
                              suppleants: [
                                ...(evenement?.suppleants || []).filter(
                                  (b) => b !== value && b !== undefined,
                                ),
                              ],
                            },
                            true,
                          );
                        }
                      }}
                      placeholder="Rechercher un suppléant"
                      roleUtilisateur={RoleValues.ROLE_INTERVENANT}
                    />
                  </Form.Item>
                  <Space size={8}>
                    <Tooltip title="Promouvoir comme intervenant">
                      <Button
                        type="link"
                        icon={<ArrowUpOutlined />}
                        className="dynamic-delete-button m-0 p-0 mr-0"
                        onClick={() => {
                          if (key > -1) {
                            setEvenement(
                              {
                                intervenant: evenement?.suppleants?.at(key),
                                suppleants: evenement?.suppleants?.filter(
                                  (b, index) => index !== key,
                                ),
                              },
                              true,
                            );
                          }
                        }}
                      />
                    </Tooltip>

                    <Button
                      type="link"
                      icon={<MinusCircleOutlined />}
                      className="dynamic-delete-button m-0 p-0"
                      onClick={() => {
                        if (key > -1) {
                          setEvenement(
                            {
                              suppleants: evenement?.suppleants?.filter(
                                (b, index) => index !== key,
                              ),
                            },
                            true,
                          );
                        }
                      }}
                    />
                  </Space>
                </Form.Item>
              ))}
              <Button
                className="fs-08 p-0 mt-0 ml-1"
                type="link"
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Ajouter un suppléant
              </Button>
              <Form.Item noStyle>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </div>
    </>
  );
}
