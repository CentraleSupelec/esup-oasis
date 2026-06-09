/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Alert, Button, Col, Divider, Form, FormInstance, InputNumber, Row, Space } from "antd";
import React, { ReactElement, useState } from "react";
import ColStyled from "@controls/ColStyled/ColStyled";
import { EvenementEtatEnvoiRHItem } from "@controls/Items/EvenementEtatEnvoiRHItem";
import { EvenementEtatValidationItem } from "@controls/Items/EvenementEtatValidationItem";
import DureeEvenementField from "@controls/Forms/DureeEvenementField";
import { Evenement } from "@lib";
import TarifEvenementField from "@controls/Forms/TarifEvenementField";
import { IEvenement, IPartialEvenement } from "@api";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { DownOutlined, InfoCircleFilled, UpOutlined } from "@ant-design/icons";
import { DureeTotaleEvenementField } from "@controls/Forms/DureeTotalEvenementField";

interface ITabPaiement {
  evenement: IEvenement;
  form: FormInstance<Evenement | undefined>;
  setEvenement: (event: IPartialEvenement | undefined) => void;
}

/**
 * Function to display the payment tab for an event
 *
 * @param {ITabPaiement} params - The parameters for the method
 * @param {Evenement} params.evenement - The event details
 * @param {FormInstance} params.form - The form instance
 * @param {Function} params.setEvenement - The function to update the event details
 *
 * @returns {ReactElement} The JSX element containing the payment tab
 */
export function TabPaiement({ evenement, form, setEvenement }: ITabPaiement): ReactElement {
  const [details, setDetails] = useState(false);
  return (
    <>
      <Row gutter={[16, 10]}>
        <Col span={24}>
          <div className="semi-bold mb-2">
            Paiement de l'intervention
            <div className="float-right">
              <EvenementEtatValidationItem evenement={evenement} />
              <EvenementEtatEnvoiRHItem evenement={evenement} />
            </div>
          </div>
        </Col>
        <Col span={24}>
          <Alert
            closable
            icon={<InfoCircleFilled />}
            title="Informations importantes sur le paiement des interventions"
            action={
              <Button
                icon={details ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setDetails(!details)}
              >
                Détails
              </Button>
            }
            description={
              details ? (
                <>
                  Les informations relatives au paiement de l'intervention sont calculées
                  automatiquement en fonction des informations saisies et du taux horaire
                  actuellement en vigueur.
                  <br />
                  <br />
                  <b>Attention</b>, les informations affichées ici ne sont pas contractuelles et
                  peuvent être modifiées par le service RH de l'établissement.
                </>
              ) : undefined
            }
            type="info"
            showIcon
            className="mb-3"
          />
        </Col>
        {evenement?.type !== TYPE_EVENEMENT_RENFORT && (
          <>
            <ColStyled md={{ span: 8, style: { textAlign: "right" } }} xs={24} sm={24}>
              Durée de préparation
            </ColStyled>
            <Col md={9} xs={24} sm={24}>
              <Form.Item name="tempsPreparation">
                <Space.Compact className="w-100">
                  <InputNumber
                    min={0}
                    precision={0}
                    value={evenement?.tempsPreparation}
                    className="text-center w-100"
                    controls={false}
                    onChange={(value) => {
                      setEvenement({
                        tempsPreparation: value !== null ? Number(value) : undefined,
                      });
                    }}
                  />
                  <Button disabled className="bg-light text-dark border-left-0">
                    {(evenement?.tempsPreparation || 0) > 1 ? "minutes" : "minute"}
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col md={3} xs={0} sm={0}>
              &nbsp;
            </Col>
          </>
        )}

        <ColStyled md={{ span: 8, style: { textAlign: "right" } }} xs={24} sm={24}>
          Durée de l'évènement
        </ColStyled>
        <Col md={9} xs={24} sm={24}>
          <Form.Item>
            <DureeEvenementField className="w-100" evenement={evenement} />
          </Form.Item>
        </Col>
        <Col md={3} xs={0} sm={0}>
          &nbsp;
        </Col>

        {evenement?.type !== TYPE_EVENEMENT_RENFORT && (
          <>
            <ColStyled md={{ span: 8, style: { textAlign: "right" } }} xs={24} sm={24}>
              Durée supplémentaire
            </ColStyled>
            <Col md={9} xs={24} sm={24}>
              <Form.Item name="tempsSupplementaire">
                <Space.Compact className="w-100">
                  <InputNumber
                    min={0}
                    precision={0}
                    className="text-center w-100"
                    controls={false}
                    value={evenement?.tempsSupplementaire}
                    onChange={(value) => {
                      setEvenement({
                        tempsSupplementaire: value !== null ? Number(value) : undefined,
                      });
                    }}
                  />
                  <Button disabled className="bg-light text-dark border-left-0">
                    {(evenement?.tempsSupplementaire || 0) > 1 ? "minutes" : "minute"}
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col md={3} xs={0} sm={0}>
              &nbsp;
            </Col>
          </>
        )}

        <Col md={8} xs={0} sm={0}>
          &nbsp;
        </Col>
        <Col md={9} xs={24} sm={24}>
          <Divider />
        </Col>
        <Col md={7} xs={0} sm={0}>
          &nbsp;
        </Col>

        <ColStyled
          className="semi-bold"
          md={{ span: 8, style: { textAlign: "right" } }}
          xs={24}
          sm={24}
        >
          Durée totale
        </ColStyled>
        <Col md={9} xs={24} sm={24}>
          <DureeTotaleEvenementField evenement={evenement} />
        </Col>
        <Col md={3} xs={0} sm={0}>
          &nbsp;
        </Col>

        {evenement.type && (
          <>
            <ColStyled
              className="semi-bold"
              md={{ span: 8, style: { textAlign: "right" } }}
              xs={24}
              sm={24}
            >
              Soit
            </ColStyled>
            <Col md={9} xs={24} sm={24}>
              <TarifEvenementField
                evenement={{ ...evenement, ...form.getFieldsValue() } as Evenement}
              />
            </Col>
          </>
        )}
      </Row>
    </>
  );
}
