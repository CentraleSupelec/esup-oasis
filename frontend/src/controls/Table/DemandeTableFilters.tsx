/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Col, Collapse, Input, Row, Select, Space, Switch } from "antd";
import { useAuth } from "../../auth/AuthProvider";
import { useApi } from "../../context/api/ApiProvider";
import { NB_MAX_ITEMS_PER_PAGE } from "../../constants";
import {
   PREFETCH_COMPOSANTES,
   PREFETCH_ETAT_DEMANDE,
   PREFETCH_FORMATIONS,
   PREFETCH_TYPES_DEMANDES,
} from "../../api/ApiPrefetchHelpers";
import { FilterOutlined } from "@ant-design/icons";
import { getEtatDemandeInfo } from "../../lib/demande";
import { FiltresFavoris } from "./FiltresFavoris";
import React from "react";
import { FiltreDemande } from "./DemandeTable";
import { RefsTourDemandes } from "../../routes/gestionnaire/demandeurs/Demandeurs";
import { FiltreFavoriDropDown } from "./FiltreFavoriDropDown";

import { UseStateDispatch } from "../../utils/utils";

export function DemandeTableFilters(props: {
   filtreDemande: FiltreDemande;
   setFiltreDemande: UseStateDispatch<FiltreDemande>;
   defaultFilter: FiltreDemande;
   refs: RefsTourDemandes;
   affichageTour?: boolean;
}) {
   const auth = useAuth();

   // Récupération de la liste des gestionnaires (hors renforts)
   const { data: gestionnaires, isFetching: isFetchingGestionnaires } =
      useApi().useGetCollectionPaginated({
         path: "/roles/{roleId}/utilisateurs",
         parameters: { roleId: "/roles/ROLE_GESTIONNAIRE" },
         page: 1,
         itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
         query: { "order[nom]": "asc" },
         enabled: !auth.impersonate && auth.user?.isPlanificateur,
      });

   // Récupération des disciplines sportives
   const { data: disciplines } = useApi().useGetCollectionPaginated({
      path: "/disciplines_sportives",
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      query: { "order[libelle]": "asc", page: 1, itemsPerPage: NB_MAX_ITEMS_PER_PAGE },
   });

   const { data: etats } = useApi().useGetCollection(PREFETCH_ETAT_DEMANDE);
   const { data: composantes } = useApi().useGetCollection(PREFETCH_COMPOSANTES);
   const { data: formations } = useApi().useGetCollection(PREFETCH_FORMATIONS);
   const { data: types } = useApi().useGetCollection(PREFETCH_TYPES_DEMANDES);

   return (
      <Collapse
         ref={props.refs.filtresDetails}
         activeKey={props.affichageTour ? ["filters", "filter_save"] : undefined}
         accordion={!props.affichageTour}
         className="mb-3"
         items={[
            {
               key: "filter_save",
               ref: props.refs.favoris,
               label: (
                  <>
                     <FiltreFavoriDropDown
                        className="float-right mt-05"
                        setFiltre={props.setFiltreDemande}
                        filtreType="filtresDemande"
                     />
                     Filtres sauvegardés
                  </>
               ),
               children: (
                  <FiltresFavoris
                     filtre={props.filtreDemande}
                     setFiltre={props.setFiltreDemande}
                     filtreType="filtresDemande"
                     defaultFilter={props.defaultFilter}
                  />
               ),
            },
            {
               key: "filters",
               ref: props.refs.filtres,
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
                           Nom du demandeur
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Input
                              allowClear
                              placeholder="Nom du demandeur"
                              value={props.filtreDemande["demandeur.nom"]}
                              onChange={(e) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    "demandeur.nom": e.target.value,
                                    page: 1,
                                 }));
                              }}
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span>Types de demande</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              placeholder="Tous les types"
                              mode="tags"
                              allowClear
                              className="w-100"
                              style={{ overflowX: "auto", maxWidth: "100%" }}
                              onChange={(value) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    etat: undefined,
                                    "campagne.typeDemande[]": value as string[],
                                    page: 1,
                                 }));
                              }}
                              value={props.filtreDemande["campagne.typeDemande[]"] || []}
                              options={[
                                 ...(types?.items || [])
                                    .filter((t) => t.actif)
                                    .map((e) => {
                                       return {
                                          label: e?.libelle,
                                          value: e?.["@id"],
                                       };
                                    }),
                              ]}
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span>États de la demande</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              placeholder="Tous les états"
                              mode="tags"
                              allowClear
                              className="w-100"
                              style={{ overflowX: "auto", maxWidth: "100%" }}
                              onChange={(value) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    etat: undefined,
                                    "etat[]": value as string[],
                                    page: 1,
                                 }));
                              }}
                              value={props.filtreDemande["etat[]"] || []}
                              options={[
                                 ...(etats?.items || [])
                                    .sort((a, b) => {
                                       const aInfo = getEtatDemandeInfo(a["@id"] as string);
                                       const bInfo = getEtatDemandeInfo(b["@id"] as string);
                                       return (aInfo?.ordre || 0) - (bInfo?.ordre || 0);
                                    })
                                    .map((e) => {
                                       const eInfo = getEtatDemandeInfo(e["@id"] as string);
                                       return {
                                          label: e?.libelle,
                                          value: e?.["@id"],
                                          icon: eInfo?.icone,
                                       };
                                    }),
                              ]}
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span aria-label="Chargés d'accompagnement">
                                 Chargé•es d'accompagnement
                              </span>
                              <span className="legende">Pour les bénéficiaires déjà connus</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              placeholder="Tous les chargés d'accompagnement"
                              mode="tags"
                              allowClear
                              loading={isFetchingGestionnaires}
                              className="w-100"
                              options={gestionnaires?.items.map((g) => ({
                                 label: `${g.nom?.toLocaleUpperCase()} ${g.prenom}`,
                                 value: g["@id"],
                              }))}
                              value={props.filtreDemande["gestionnaire[]"]}
                              onChange={(value) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    "gestionnaire[]": value as string[],
                                    page: 1,
                                 }));
                              }}
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span>Disciplines sportives</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              allowClear
                              mode="tags"
                              className="w-100"
                              placeholder="Toutes les disciplines"
                              value={props.filtreDemande["discipline[]"]}
                              onChange={(value) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    "discipline[]": value as string[],
                                    page: 1,
                                 }));
                              }}
                              options={(disciplines?.items || []).map((c) => ({
                                 label: c.libelle,
                                 value: c["@id"],
                              }))}
                              optionFilterProp="label"
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span>Composantes</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              allowClear
                              mode="tags"
                              className="w-100"
                              placeholder="Toutes les composantes"
                              value={props.filtreDemande["composante[]"]}
                              onChange={(value) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    "composante[]": value as string[],
                                    page: 1,
                                 }));
                              }}
                              options={(composantes?.items || []).map((c) => ({
                                 label: c.libelle,
                                 value: c["@id"],
                              }))}
                              optionFilterProp="label"
                           />
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span>Formations</span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Select
                              allowClear
                              mode="tags"
                              className="w-100"
                              placeholder="Toutes les formations"
                              value={props.filtreDemande["formation[]"]}
                              onChange={(value) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    "formation[]": value as string[],
                                    page: 1,
                                 }));
                              }}
                              options={(formations?.items || []).map((c) => ({
                                 label: `[${c.codeExterne?.replace("#", "-")}] ${c.libelle}`,
                                 value: c["@id"],
                              }))}
                              optionFilterProp="label"
                           />
                           <div className="legende">
                              Seules les formations ayant au moins un demandeur sont proposées.
                           </div>
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                           <Space direction="vertical" size={0}>
                              <span aria-label="Afficher les campagnes archivées">
                                 Afficher campagnes archivées
                              </span>
                           </Space>
                        </Col>
                        <Col xs={24} sm={24} md={18}>
                           <Switch
                              checked={props.filtreDemande.archivees}
                              onChange={(checked) => {
                                 props.setFiltreDemande((prev) => ({
                                    ...prev,
                                    archivees: checked,
                                    page: 1,
                                 }));
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
