/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Form } from "antd";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import UtilisateurFormItemSelect from "@controls/Forms/UtilisateurFormItemSelect";
import { Evenement, RoleValues } from "@lib";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import React, { ReactElement } from "react";
import { IInterventionForfait, IPartialEvenement } from "@api";

interface TabEvenementParticipantsBeneficiairesProps {
  evenement: Evenement | Partial<IInterventionForfait> | undefined;
  setEvenement: (
    data: IPartialEvenement | Partial<IInterventionForfait> | undefined,
    forceResetForm: boolean,
  ) => void;
  title?: ReactElement | string;
}

/**
 * Renders a list of beneficiaires for an evenement.
 *
 * @param {TabEvenementParticipantsBeneficiairesProps} props - The component props.
 * @param {Evenement} [props.evenement] - The evenement object.
 * @param {function} props.setEvenement - The function to update the evenement object.
 *
 * @returns {ReactElement | null} - The rendered component.
 */
export function TabEvenementParticipantsBeneficiaires({
  evenement,
  setEvenement,
  title = "Bénéficiaires",
}: TabEvenementParticipantsBeneficiairesProps): ReactElement | null {
  if (evenement?.type === TYPE_EVENEMENT_RENFORT) {
    // les événements de type renfort n'ont pas de bénéficiaires
    return null;
  }

  return (
    <>
      <div className="ant-form-item">
        <Form.List
          name="beneficiaires"
          rules={[
            {
              validator: async (_, values) => {
                if (
                  evenement instanceof Evenement &&
                  evenement?.type !== TYPE_EVENEMENT_RENFORT &&
                  (!values || values.length < 1)
                ) {
                  return Promise.reject(new Error("Vous devez préciser un bénéficiaire"));
                }
              },
            },
          ]}
        >
          {(fields, { add }, { errors }) => (
            <>
              {title}
              {fields.map(({ key, ...field }) => (
                <Form.Item
                  className="mb-0"
                  required={false}
                  key={evenement?.beneficiaires?.at(key)}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Un bénéficiaire est requis ou supprimez ce champ.",
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
                              beneficiaires: [
                                ...(evenement?.beneficiaires || []).filter(
                                  (b) => b !== value && b !== undefined && b !== "",
                                ),
                                value,
                              ],
                            },
                            true,
                          );
                        } else {
                          setEvenement(
                            {
                              beneficiaires: [
                                ...(evenement?.beneficiaires || []).filter(
                                  (b) => b !== value && b !== undefined,
                                ),
                              ],
                            },
                            true,
                          );
                        }
                      }}
                      placeholder="Rechercher un bénéficiaire"
                      roleUtilisateur={RoleValues.ROLE_BENEFICIAIRE}
                    />
                  </Form.Item>
                  <Button
                    type="link"
                    icon={<MinusCircleOutlined />}
                    className="dynamic-delete-button m-0 p-0"
                    onClick={() => {
                      if (key > -1) {
                        setEvenement(
                          {
                            beneficiaires: evenement?.beneficiaires?.filter(
                              (b, index) => index !== key,
                            ),
                          },
                          true,
                        );
                      }
                    }}
                  />
                </Form.Item>
              ))}
              <Button
                className="fs-08 p-0 mt-0 ml-1"
                type="link"
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Ajouter un bénéficiaire
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
