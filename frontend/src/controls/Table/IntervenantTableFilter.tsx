/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Collapse, Input, Row, Select, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { FiltresFavoris } from "./FiltresFavoris";
import { FILTRE_INTERVENANT_DEFAULT, FiltreIntervenant } from "./IntervenantTable";
import { PREFETCH_CAMPUS, PREFETCH_COMPETENCES, PREFETCH_TYPES_EVENEMENTS } from "../../api/ApiPrefetchHelpers";
import { useApi } from "../../context/api/ApiProvider";
import { FiltreFavoriDropDown } from "./FiltreFavoriDropDown";

export function IntervenantTableFilter(props: {
   filtreIntervenant: FiltreIntervenant;
   setFiltreIntervenant: React.Dispatch<React.SetStateAction<FiltreIntervenant>>;
}) {
   const { data: campuses } = useApi().useGetCollection(PREFETCH_CAMPUS);
   const { data: competences } = useApi().useGetCollection(PREFETCH_COMPETENCES);
   const { data: categories } = useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);

   return (
      <Collapse
         accordion
         className="mb-3"
         items={[
            {
               key: "filter_save",
               label: (
                  <>
                     <FiltreFavoriDropDown
                        className="float-right mt-05"
                        setFiltre={props.setFiltreIntervenant}
                        filtreType="filtresIntervenant"
                     />
                     Filtres sauvegardés
                  </>
               ),
               children: (
                  <FiltresFavoris
                     filtre={props.filtreIntervenant}
                     setFiltre={props.setFiltreIntervenant}
                     filtreType="filtresIntervenant"
                     defaultFilter={FILTRE_INTERVENANT_DEFAULT}
                  />
               ),
            },
            {
               key: "filters",
               label: (
                  <>
                     <FilterOutlined className="float-right" style={{ marginTop: 4 }} aria-hidden />
                     Filtres complémentaires
                  </>
               ),
               children: (
                  <>
                     <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={6}>
                           Nom de l'intervenant
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Input
                              allowClear
                              placeholder="Nom de l'intervenant"
                              value={props.filtreIntervenant.nom}
                              onChange={(e) => {
                                 props.setFiltreIntervenant((prev) => ({
                                    ...prev,
                                    nom: e.target.value,
                                    page: 1,
                                 }));
                              }}
                           />
                        </Col>
                        <Col xs={24} sm={24} md={6}>
                           <Space orientation="vertical" size={0}>
                              <span>Statut</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              allowClear
                              placeholder="Tous les intervenants"
                              className="w-100"
                              options={[
                                 {
                                    label: "Intervenants actifs (et futurs actifs)",
                                    value: false,
                                 },
                                 {
                                    label: "Intervenants archivés",
                                    value: true,
                                 },
                              ]}
                              value={props.filtreIntervenant.intervenantArchive}
                              onChange={(value) => {
                                 props.setFiltreIntervenant({
                                    ...props.filtreIntervenant,
                                    intervenantArchive: value,
                                    page: 1,
                                 });
                              }}
                           />
                        </Col>
                        <Col xs={24} sm={24} md={6}>
                           <Space orientation="vertical" size={0}>
                              <span>Campus d'intervention</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              mode="tags"
                              allowClear
                              placeholder="Tous les campus"
                              className="w-100"
                              options={[
                                 ...(campuses?.items || [])
                                    .filter((c) => c.actif)
                                    .map((c) => ({
                                       label: c.libelle,
                                       value: c["@id"],
                                    })),
                              ]}
                              value={props.filtreIntervenant["intervenant.campuses[]"]}
                              onChange={(value) => {
                                 props.setFiltreIntervenant({
                                    ...props.filtreIntervenant,
                                    "intervenant.campuses[]": value,
                                    page: 1,
                                 });
                              }}
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space orientation="vertical" size={0}>
                              <span>Compétences</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              mode="tags"
                              allowClear
                              placeholder="Toutes les compétences"
                              className="w-100"
                              options={[
                                 ...(competences?.items || [])
                                    .filter((c) => c.actif)
                                    .map((c) => ({
                                       label: c.libelle,
                                       value: c["@id"],
                                    })),
                              ]}
                              value={props.filtreIntervenant["intervenant.competences[]"]}
                              onChange={(value) => {
                                 props.setFiltreIntervenant({
                                    ...props.filtreIntervenant,
                                    "intervenant.competences[]": value,
                                    page: 1,
                                 });
                              }}
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space orientation="vertical" size={0}>
                              <span>Catégories d'évènements</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              mode="tags"
                              allowClear
                              placeholder="Toutes les catégories"
                              className="w-100"
                              options={[
                                 ...(categories?.items || [])
                                    .filter((c) => c.actif)
                                    .map((c) => ({
                                       label: c.libelle,
                                       value: c["@id"],
                                    })),
                              ]}
                              value={props.filtreIntervenant["intervenant.typesEvenements[]"]}
                              onChange={(value) => {
                                 props.setFiltreIntervenant({
                                    ...props.filtreIntervenant,
                                    "intervenant.typesEvenements[]": value,
                                    page: 1,
                                 });
                              }}
                           />
                        </Col>
                     </Row>
                  </>
               ),
            },
         ]}
      />
   );
}
