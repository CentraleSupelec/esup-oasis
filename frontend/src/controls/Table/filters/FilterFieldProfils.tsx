/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Select, Space } from "antd";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";
import { IProfil } from "@api";
import { Utilisateur } from "@lib";
import { BENEFICIAIRE_PROFIL_A_DETERMINER } from "@/constants";

interface FilterFieldProfilsProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
  profils: { items: IProfil[] } | undefined;
  nbBeneficiairesIncomplets: number | undefined;
  user: Utilisateur | null | undefined;
}

export function FilterFieldProfils({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
  profils,
  nbBeneficiairesIncomplets,
  user,
}: FilterFieldProfilsProps) {
  if (!user?.isGestionnaire) {
    return null;
  }

  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Profils</span>
          <div className={`legende ${(nbBeneficiairesIncomplets || 0) > 1 ? "text-danger" : ""}`}>
            {nbBeneficiairesIncomplets} profil
            {(nbBeneficiairesIncomplets || 0) > 1 && "s"} à renseigner
          </div>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Select
          allowClear
          className="w-100"
          placeholder="Tous les profils"
          value={filtreBeneficiaire["filtreBeneficiaire[profil]"]}
          onChange={(value) => {
            setFiltreBeneficiaire((prev) => ({
              ...prev,
              "filtreBeneficiaire[profil]": value === "undefined" ? undefined : value,
              page: 1,
            }));
          }}
          options={[
            {
              label: "Profils à renseigner",
              value: BENEFICIAIRE_PROFIL_A_DETERMINER,
            },
            ...(profils?.items || [])
              .filter((p) => p.actif && p["@id"] !== BENEFICIAIRE_PROFIL_A_DETERMINER)
              .map((profil) => ({
                label: profil.libelle,
                value: profil["@id"],
              })),
          ]}
        />
      </Col>
    </>
  );
}
