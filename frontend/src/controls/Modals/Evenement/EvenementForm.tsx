/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { App, Col, Form, FormInstance, Row, Tabs } from "antd";
import dayjs from "dayjs";
import TabEvenementInformations from "@controls/TabsContent/TabEvenementInformations";
import { TabEquipement } from "@controls/TabsContent/TabEquipement";
import { TabPaiement } from "@controls/TabsContent/TabPaiement";
import { Evenement } from "@lib";
import { isDateValid } from "@utils/dates";
import { IPartialEvenement } from "@api";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";

interface IEvenementFormProps {
  form: FormInstance<Evenement | undefined>;
  evenement: Evenement;
  formIsDirty: boolean;
  updateSourceEvenement: (values: IPartialEvenement | undefined, forceResetForm?: boolean) => void;
  onFinish: (values: Evenement | undefined) => void;
  disabled?: boolean;
}

export default function EvenementForm({
  form,
  evenement,
  formIsDirty,
  updateSourceEvenement,
  onFinish,
  disabled,
}: IEvenementFormProps): ReactElement {
  const { message } = App.useApp();

  return (
    <Form<Evenement | undefined>
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={(errorInfo) => {
        errorInfo.errorFields.forEach((error) => {
          form.scrollToField(error.name);
          message.error(error.errors[0]).then();
        });
      }}
      disabled={disabled}
      onValuesChange={(changedValues) => {
        updateSourceEvenement(changedValues);
      }}
    >
      <Tabs
        type="card"
        defaultActiveKey="informations"
        items={[
          {
            key: "informations",
            label: `Informations`,
            children: (
              <TabEvenementInformations
                evenement={evenement}
                formIsDirty={formIsDirty}
                setEvenement={updateSourceEvenement}
              />
            ),
          },
          {
            key: "amenagements-examens",
            label: `Aménagements d'examens`,
            children: <TabEquipement />,
          },
          {
            key: "paiement",
            label: `Paiement`,
            children: (
              <TabPaiement form={form} evenement={evenement} setEvenement={updateSourceEvenement} />
            ),
            disabled: !isDateValid(evenement?.debut) || !isDateValid(evenement?.fin),
          },
        ]}
        className="tab-bordered tab-overflow-70vh mt-3"
      />

      <Row className="mb-3">
        <Col span={24} className="legende mt-1">
          Créé le {dayjs(evenement.dateCreation).format("DD/MM/YYYY")}
          {evenement.utilisateurCreation && (
            <>
              {" "}
              par{" "}
              <GestionnaireItem gestionnaireId={evenement.utilisateurCreation} showAvatar={false} />
            </>
          )}
          {evenement.dateModification && (
            <>
              {" "}
              &bull; Dernière modification le{" "}
              {dayjs(evenement.dateModification).format("DD/MM/YYYY")}
              {evenement.utilisateurModification && (
                <>
                  {" "}
                  par{" "}
                  <GestionnaireItem
                    gestionnaireId={evenement.utilisateurModification}
                    showAvatar={false}
                  />
                </>
              )}
            </>
          )}
        </Col>
      </Row>
    </Form>
  );
}
