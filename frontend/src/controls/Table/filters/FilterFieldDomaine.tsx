/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Avatar, Checkbox, Col, Flex, Segmented } from "antd";
import { FiltreAmenagement } from "@controls/Table/AmenagementTableLayout";
import { AmenagementDomaine, DOMAINES_AMENAGEMENTS_INFOS } from "@lib";
import { ModeAffichageAmenagement } from "@routes/gestionnaire/beneficiaires/Amenagements";

interface FilterFieldDomaineProps {
  filtreAmenagement: FiltreAmenagement;
  setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
  modeAffichage: ModeAffichageAmenagement;
  estRenfort: boolean;
  estReferent: boolean;
}

export function FilterFieldDomaine({
  filtreAmenagement,
  setFiltreAmenagement,
  modeAffichage,
  estRenfort,
  estReferent,
}: FilterFieldDomaineProps) {
  if (estRenfort) {
    return null;
  }

  return (
    <>
      <Col xs={24} sm={24} md={6}>
        Domaine
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Flex justify="space-between" align="center">
          <Segmented
            disabled={estRenfort}
            options={[
              { label: "Tous", value: "Tous" },
              ...Object.keys(DOMAINES_AMENAGEMENTS_INFOS)
                .map((d) => DOMAINES_AMENAGEMENTS_INFOS[d])
                .sort((a, b) => a.order - b.order)
                .filter((d) => !estReferent || d.visibleReferent)
                .filter((d) => !estRenfort || d.visibleRenfort)
                .map((d) => ({
                  label: (
                    <Flex align="center" gap={8}>
                      <Avatar className={`bg-${d.couleur}`} size={16} />
                      <span>{d.singulier}</span>
                    </Flex>
                  ),
                  value: d.id,
                })),
            ]}
            style={{ overflowX: "auto", maxWidth: "100%" }}
            value={filtreAmenagement.domaine}
            onChange={(value) => {
              setFiltreAmenagement((prev) => {
                let restreindre = prev.restreindreColonnes && value !== "Tous";
                if (prev.domaine === "Tous" && value !== "Tous") {
                  restreindre = true;
                }

                return {
                  ...prev,
                  domaine: value as AmenagementDomaine | "Tous",
                  restreindreColonnes:
                    modeAffichage === ModeAffichageAmenagement.ParBeneficiaire
                      ? restreindre
                      : false,
                  "type[]": [],
                  "categorie[]": [],
                  page: 1,
                };
              });
            }}
          />
          {modeAffichage === ModeAffichageAmenagement.ParBeneficiaire &&
            filtreAmenagement.domaine !== "Tous" && (
              <Checkbox
                disabled={estRenfort}
                checked={filtreAmenagement.restreindreColonnes}
                onChange={(e) =>
                  setFiltreAmenagement((prev) => ({
                    ...prev,
                    restreindreColonnes: e.target.checked,
                    page: 1,
                  }))
                }
              >
                Restreindre les colonnes
              </Checkbox>
            )}
        </Flex>
      </Col>
    </>
  );
}
