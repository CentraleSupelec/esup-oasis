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
import { useDrawers } from "@context/drawers/DrawersContext";
import UtilisateurCreerDrawer from "@controls/Drawers/Utilisateur/UtilisateurCreerDrawer";
import { RoleValues } from "@lib";
import BeneficiaireTable from "@controls/Table/BeneficiaireTable";

/**
 * Renders the page for ROLE_GESTIONNAIRE to manage beneficiaries.
 *
 * @returns {ReactElement} The rendered Beneficiaires component.
 */
export default function Beneficiaires(): ReactElement {
  const { setDrawerUtilisateur } = useDrawers();
  const [ajouterBeneficiaire, setAjouterBeneficiaire] = useState(false);

  return (
    <Layout.Content className="beneficiaires" style={{ padding: "0 50px" }}>
      <UtilisateurCreerDrawer
        type={RoleValues.ROLE_BENEFICIAIRE}
        open={ajouterBeneficiaire}
        setOpen={setAjouterBeneficiaire}
        onChange={(utilisateur) => {
          setAjouterBeneficiaire(false);
          setDrawerUtilisateur({
            utilisateur: utilisateur["@id"],
            role: RoleValues.ROLE_BENEFICIAIRE,
          });
        }}
      />
      <Typography.Title level={1}>Bénéficiaires</Typography.Title>
      <BeneficiaireTable />
      <FloatButton
        onClick={() => setAjouterBeneficiaire(true)}
        icon={<PlusOutlined />}
        type="primary"
        tooltip="Ajouter un bénéficiaire"
      />
    </Layout.Content>
  );
}
