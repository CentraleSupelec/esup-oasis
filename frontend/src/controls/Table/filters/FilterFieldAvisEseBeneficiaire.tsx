/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Segmented } from "antd";
import { CheckCircleFilled, HourglassOutlined } from "@ant-design/icons";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";
import { EtatAvisEse } from "@controls/Avatars/BeneficiaireAvisEseAvatar";
import { env } from "@/env";

interface FilterFieldAvisEseBeneficiaireProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
}

export function FilterFieldAvisEseBeneficiaire({
  filtreBeneficiaire: _filtreBeneficiaire,
  setFiltreBeneficiaire,
}: FilterFieldAvisEseBeneficiaireProps) {
  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Avis {env.REACT_APP_ESPACE_SANTE_ABV || "santé"}
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Segmented
          style={{ overflowX: "auto", maxWidth: "100%" }}
          onChange={(value) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              etatAvisEse: value === "undefined" ? undefined : (value as EtatAvisEse),
              page: 1,
            }));
          }}
          options={[
            {
              label: "Tous",
              value: "undefined",
            },
            {
              label: "En attente",
              value: EtatAvisEse.ETAT_EN_ATTENTE,
              icon: <HourglassOutlined className="text-warning" />,
            },
            {
              label: "En cours",
              value: EtatAvisEse.ETAT_EN_COURS,
              icon: <CheckCircleFilled className="text-success" />,
            },
            {
              label: "Aucun",
              value: EtatAvisEse.ETAT_AUCUN,
            },
          ]}
        />
      </Col>
    </>
  );
}
