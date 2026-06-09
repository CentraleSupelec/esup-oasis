/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import { Col, Row } from "antd";
import { Evenement } from "@lib";
import { MesInterventionsIntro } from "@controls/Calendar/Toolbar/MesInterventionsIntro";
import ToolbarNavigation from "@controls/Calendar/Toolbar/ToolbarNavigation";
import ToolbarDisplay from "@controls/Calendar/Toolbar/ToolbarDisplay";
import ToolbarActions from "@controls/Calendar/Toolbar/ToolbarActions";

interface IToolbar {
  saisieEvtRenfort?: boolean;
  evenements: Evenement[];
}

/**
 * Renders the toolbar component for the calendar.
 * @param {Object} params - The parameters for the toolbar.
 * @param {boolean} [params.saisieEvtRenfort] - If true, displays the intro for reinforcement events input.
 * @param {Evenement[]} params.evenements - The array of events.
 */
export default function Toolbar({ saisieEvtRenfort, evenements }: IToolbar) {
  useEffect(() => {
    document
      .querySelectorAll(".ant-segmented-item-input")
      .forEach((el) => el.setAttribute("role", "option"));
  });

  return (
    <>
      {saisieEvtRenfort && <MesInterventionsIntro />}
      <Row className="toolbar-container">
        <Col span={8}>
          <ToolbarNavigation />
        </Col>
        <Col span={16} className="text-right">
          <ToolbarDisplay saisieEvtRenfort={saisieEvtRenfort} evenements={evenements} />
        </Col>
      </Row>
      <ToolbarActions saisieEvtRenfort={saisieEvtRenfort} />
    </>
  );
}
