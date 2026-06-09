/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { FloatButton, Layout, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import UtilisateurCreerDrawer from "@controls/Drawers/Utilisateur/UtilisateurCreerDrawer";
import { useDrawers } from "@context/drawers/DrawersContext";
import { RoleValues } from "@lib";
import IntervenantTable from "@controls/Table/IntervenantTable";

/**
 * Renders the page for ROLE_GESTIONNAIRE to manage intervenants.
 * @returns {ReactElement} The rendered Intervenants component.
 * */
export default function Intervenants(): ReactElement {
  const { setDrawerUtilisateur } = useDrawers();
  const [ajouterIntervenant, setAjouterIntervenant] = useState(false);

  return (
    <Layout.Content className="intervenants" style={{ padding: "0 50px" }}>
      <UtilisateurCreerDrawer
        type={RoleValues.ROLE_INTERVENANT}
        open={ajouterIntervenant}
        setOpen={setAjouterIntervenant}
        onChange={(user) => {
          setAjouterIntervenant(false);
          setDrawerUtilisateur({
            utilisateur: user["@id"],
            role: RoleValues.ROLE_INTERVENANT,
          });
        }}
      />
      <Typography.Title level={1}>Intervenants</Typography.Title>
      <IntervenantTable />
      <FloatButton
        onClick={() => setAjouterIntervenant(true)}
        icon={<PlusOutlined />}
        type="primary"
        tooltip="Ajouter un intervenant"
      />
    </Layout.Content>
  );
}
