/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { FloatButton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/auth/AuthProvider";
import { useModals } from "@context/modals/ModalsContext";

interface IToolbarActions {
  saisieEvtRenfort?: boolean;
}

export default function ToolbarActions({ saisieEvtRenfort }: IToolbarActions) {
  const auth = useAuth();
  const { setModalEvenement } = useModals();

  if (!auth.user?.isPlanificateur) {
    return null;
  }

  return (
    <FloatButton
      icon={<PlusOutlined />}
      type="primary"
      aria-label="Ajouter un évènement"
      tooltip="Ajouter un évènement"
      onClick={() => {
        setModalEvenement(saisieEvtRenfort ? { intervenant: auth.user?.["@id"] } : {});
      }}
    />
  );
}
