/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import "@routes/administration/Administration.scss";
import { FloatButton, Layout, Typography } from "antd";
import { CopyOutlined, FileOutlined, PlusOutlined } from "@ant-design/icons";
import InterventionsForfaitEdit from "@controls/Interventions/InterventionsForfaitEdit";
import InterventionForfaitTable from "@controls/Table/InterventionForfaitTable";
import InterventionsForfaitBulkAdd from "@controls/Interventions/InterventionsForfaitBulkAdd";
import { IInterventionForfait } from "@api";

/**
 * Renders the component for managing interventions au forfait.
 *
 * @return {ReactElement} The component for managing interventions au forfait.
 */
export default function InterventionsForfait(): ReactElement {
  const [editedItem, setEditedItem] = useState<Partial<IInterventionForfait>>();
  const [bulkAdd, setBulkAdd] = useState(false);

  return (
    <Layout.Content style={{ padding: "0 50px" }}>
      <Typography.Title level={1}>
        Interventions au forfait{" "}
        <span className="fs-12 text-legende fw-regular">(Prise de notes)</span>
      </Typography.Title>
      <InterventionForfaitTable onEdit={setEditedItem} />
      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<PlusOutlined />}
        style={{ right: 60, bottom: 40 }}
      >
        <FloatButton
          className="float-button-fix"
          icon={<CopyOutlined rotate={180} />}
          tooltip="Ajouter plusieurs interventions au forfait"
          onClick={() => {
            setBulkAdd(true);
            setEditedItem(undefined);
          }}
        />
        <FloatButton
          onClick={() => {
            setBulkAdd(false);
            setEditedItem({});
          }}
          icon={<FileOutlined />}
          tooltip="Ajouter une intervention au forfait"
        />
      </FloatButton.Group>
      {editedItem && (
        <InterventionsForfaitEdit editedItem={editedItem} setEditedItem={setEditedItem} />
      )}
      {bulkAdd && <InterventionsForfaitBulkAdd onClose={() => setBulkAdd(false)} />}
    </Layout.Content>
  );
}
