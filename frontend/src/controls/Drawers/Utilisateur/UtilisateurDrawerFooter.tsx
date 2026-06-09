/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Alert, Button, Form } from "antd";
import { SaveOutlined } from "@ant-design/icons";

interface UtilisateurDrawerFooterProps {
  activeTab: string;
  isBeneficiaireSansProfil: boolean;
  isIntervenantSansTypeEvenement: boolean;
}

const TabWithSaveButton = ["informations", "competences", "campus", "categories"];

export default function UtilisateurDrawerFooter({
  activeTab,
  isBeneficiaireSansProfil,
  isIntervenantSansTypeEvenement,
}: UtilisateurDrawerFooterProps) {
  if (!TabWithSaveButton.includes(activeTab)) {
    return null;
  }

  return (
    <Form.Item className="mt-2 text-center">
      {isBeneficiaireSansProfil && (
        <Alert
          title={
            <>
              Attention, un bénéficiaire doit au minimum avoir un <b>profil</b>.
            </>
          }
          className="mb-2"
          type="warning"
        />
      )}
      {isIntervenantSansTypeEvenement && (
        <Alert
          title={
            <>
              Attention, un intervenant doit au minimum être lié à une <b>catégorie</b> d'évènement.
            </>
          }
          className="mb-2"
          type="warning"
        />
      )}
      <Button
        type="primary"
        icon={<SaveOutlined />}
        htmlType="submit"
        disabled={isBeneficiaireSansProfil || isIntervenantSansTypeEvenement}
      >
        Enregistrer
      </Button>
    </Form.Item>
  );
}
