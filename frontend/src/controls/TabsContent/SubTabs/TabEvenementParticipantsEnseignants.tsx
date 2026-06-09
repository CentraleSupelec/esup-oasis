/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { Button, Form, Space } from "antd";
import UtilisateurFormItemSelect from "@controls/Forms/UtilisateurFormItemSelect";
import { Evenement, RoleValues } from "@lib";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import React, { ReactElement } from "react";
import { IPartialEvenement } from "@api";

interface TabEvenementParticipantsEnseignantsProps {
  evenement: Evenement | undefined;
  setEvenement: (data: IPartialEvenement | undefined, forceResetForm: boolean) => void;
}

/**
 * This method renders a form for managing the participants (teachers) of an event.
 *
 * @param {TabEvenementParticipantsEnseignantsProps} params - The parameters object.
 * @param {Evenement} [params.evenement] - The event object.
 * @param {function} params.setEvenement - The function to set the event object.
 *
 * @returns {ReactElement | null} - The rendered form.
 */
export function TabEvenementParticipantsEnseignants({
  evenement,
  setEvenement,
}: TabEvenementParticipantsEnseignantsProps): ReactElement | null {
  if (evenement?.type === TYPE_EVENEMENT_RENFORT) {
    // les événements de type renfort n'ont pas d'enseignants
    return null;
  }

  return (
    <>
      <div className="ant-form-item mt-2">
        <Form.List name="enseignants">
          {(fields, { add }, { errors }) => (
            <>
              <div className="semi-bold">Enseignants</div>
              {fields.map(({ key, ...field }) => (
                <Form.Item className="mb-0" required={false} key={evenement?.enseignants?.at(key)}>
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Un enseignant est requis ou supprimez ce champ.",
                      },
                    ]}
                    noStyle
                  >
                    <UtilisateurFormItemSelect
                      style={{ width: "calc(100% - 35px)" }}
                      onSelect={(value) => {
                        if (value) {
                          setEvenement(
                            {
                              enseignants: [
                                ...(evenement?.enseignants || []).filter(
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
                              enseignants: [
                                ...(evenement?.enseignants || []).filter(
                                  (b) => b !== value && b !== undefined,
                                ),
                              ],
                            },
                            true,
                          );
                        }
                      }}
                      placeholder="Rechercher un enseignant"
                      roleUtilisateur={RoleValues.ROLE_ENSEIGNANT}
                    />
                  </Form.Item>
                  <Space size={8}>
                    <Button
                      type="link"
                      icon={<MinusCircleOutlined />}
                      className="dynamic-delete-button m-0 p-0"
                      onClick={() => {
                        if (key > -1) {
                          setEvenement(
                            {
                              enseignants: evenement?.enseignants?.filter(
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
                Ajouter un enseignant
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
