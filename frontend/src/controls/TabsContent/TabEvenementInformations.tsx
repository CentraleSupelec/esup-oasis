/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Col, Form, Input, Row } from "antd";
import React, { ReactElement } from "react";
import CampusFilter from "@controls/Filters/Campus/CampusFilter";
import { useApi } from "@context/api/ApiProvider";
import { Evenement } from "@lib";
import { IPartialEvenement, PREFETCH_TYPES_EVENEMENTS } from "@api";
import { CategorieSelectWithAvatar } from "@controls/Forms/CategorieSelectWithAvatar";
import { TabEvenementParticipants } from "@controls/TabsContent/SubTabs/TabEvenementParticipants";
import { TabEvenementPlanification } from "@controls/TabsContent/SubTabs/TabEvenementPlanification";

interface ITabEvenementInformations {
  evenement: Evenement | undefined;
  setEvenement: (data: IPartialEvenement | undefined, forceResetForm: boolean) => void;
  intervenantDisabled?: boolean;
  formIsDirty: boolean;
}

export default function TabEvenementInformations({
  evenement,
  setEvenement,
  intervenantDisabled,
  formIsDirty,
}: ITabEvenementInformations): ReactElement {
  const { data: categories } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  const typeSelectionne = evenement?.type;

  return (
    <>
      <div
        className={`p-2 border-2 border-radius border-${
          categories?.items.find((c) => c["@id"] === typeSelectionne)?.couleur
        }-light bg-${categories?.items.find((c) => c["@id"] === typeSelectionne)?.couleur}-xlight`}
      >
        <CategorieSelectWithAvatar
          typeSelectionne={typeSelectionne}
          setTypeSelectionne={() => {}}
        />

        <Form.Item name="libelle" label="Libellé">
          <Input className="semi-bold" />
        </Form.Item>
        <Row gutter={32}>
          <Col md={12} xs={24} sm={24}>
            <Form.Item
              name="campus"
              label="Campus"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <CampusFilter />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} sm={24}>
            <Form.Item name="salle" label="Salle">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <Row gutter={32} className="">
        <Col md={12} xs={24} sm={24}>
          <TabEvenementPlanification
            evenement={evenement}
            setEvenement={setEvenement}
            formIsDirty={formIsDirty}
          />
        </Col>
        <Col md={12} xs={24} sm={24}>
          <TabEvenementParticipants
            evenement={evenement}
            setEvenement={setEvenement}
            intervenantDisabled={intervenantDisabled}
          />
        </Col>
      </Row>
    </>
  );
}
