/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

import React, { useEffect, useState } from "react";
import { IDemande } from "../../api/ApiTypeHelpers";
import { Button, Flex, Table, Tooltip } from "antd";
import { useApi } from "../../context/api/ApiProvider";
import { useAuth } from "../../auth/AuthProvider";
import { useDispatch } from "react-redux";
import { SorterResult } from "antd/es/table/interface";
import { setAffichageFiltres } from "../../redux/actions/AffichageFiltre";
import { initialAffichageFiltres } from "../../redux/context/IAffichageFiltres";
import { queryClient } from "../../App";
import { PREFETCH_ETAT_DEMANDE } from "../../api/ApiPrefetchHelpers";
import { useNavigate, useSearchParams } from "react-router-dom";
import DemandeTableExport from "./DemandeTableExport";
import { demandeTableColumns } from "./DemandeTableColumns";
import { DemandeTableFilters } from "./DemandeTableFilters";
import { ReactComponent as Unfilter } from "../../assets/images/unfilter.svg";
import Icon from "@ant-design/icons";
import { ascendToAsc } from "../../utils/array";
import { RefsTourDemandes } from "../../routes/gestionnaire/demandeurs/Demandeurs";
import FiltreDescription from "./FiltreDescription";
import { usePreferences } from "../../context/utilisateurPreferences/UtilisateurPreferencesProvider";
import { getCountLibelle } from "../../utils/table";

export const FILTRE_DEMANDE_DEFAULT: FiltreDemande = {
   "order[demandeur.nom]": "asc",
   archivees: false,
   itemsPerPage: 25,
   page: 1,
};

export type FiltreDemande = {
   /** @description The collection page number */
   page: number;
   /** @description The number of items per page */
   itemsPerPage: number;
   "demandeur.nom"?: string;
   "demandeur.prenom"?: string;
   etat?: string;
   "etat[]"?: string[];
   "campagne.typeDemande"?: string;
   "campagne.typeDemande[]"?: string[];
   "campagne.typeDemande.libelle"?: string;
   demandeur?: string;
   "demandeur[]"?: string[];
   "order[demandeur.nom]"?: "asc" | "desc";
   "order[dateDepot]"?: "asc" | "desc";
   "composante[]"?: string[];
   "formation[]"?: string[];
   "discipline[]"?: string[];
   "gestionnaire[]"?: string[];
   archivees?: boolean;
};

function filtreDemandeDefault(
   filtreType: string | null,
   filtreValeur: string | null,
): FiltreDemande {
   switch (filtreType) {
      case "etat":
         return {
            ...FILTRE_DEMANDE_DEFAULT,
            "etat[]": [filtreValeur as string],
         };
      default:
         return FILTRE_DEMANDE_DEFAULT;
   }
}

export default function DemandeTable(props: { refs: RefsTourDemandes; affichageTour?: boolean }) {
   const auth = useAuth();
   const [searchParams] = useSearchParams();
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [count, setCount] = React.useState<number>();
   const { getPreferenceArray, preferencesChargees } = usePreferences();
   const [hasImpersonate, setHasImpersonate] = useState(false);
   const [filtreDemande, setFiltreDemande] = useState<FiltreDemande>({
      ...filtreDemandeDefault(searchParams.get("filtreType"), searchParams.get("filtreValeur")),
      // on applique le filtre favori des préférences de l'utilisateur s'il existe
      // on applique le filtre favori des préférences de l'utilisateur s'il existe
      ...(searchParams.get("filtreType") === null
         ? {
              ...getPreferenceArray("filtresDemande")?.filter((f) => f.favori)[0]?.filtre,
              page: 1,
           }
         : null),
   });
   const { data: dataDemandes, isFetching: isFetchingDemandes } =
      useApi().useGetCollectionPaginated({
         path: "/demandes",
         page: filtreDemande.page || 1,
         itemsPerPage: filtreDemande.itemsPerPage,
         query: {
            ...filtreDemande,
            format_simple: true,
         },
      });
   const { data: etats } = useApi().useGetCollection(PREFETCH_ETAT_DEMANDE);

   useEffect(() => {
      if (
         preferencesChargees &&
         getPreferenceArray("filtresDemande")?.filter((f) => f.favori).length > 0
      ) {
         setFiltreDemande({
            ...FILTRE_DEMANDE_DEFAULT,
            // on applique le filtre favori des préférences de l'utilisateur s'il existe
            ...{
               ...getPreferenceArray("filtresDemande")?.filter((f) => f.favori)[0]?.filtre,
               page: 1,
            },
         });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [preferencesChargees]);

   useEffect(() => {
      if (searchParams.get("filtreType") && searchParams.get("filtreValeur")) {
         setFiltreDemande(
            filtreDemandeDefault(searchParams.get("filtreType"), searchParams.get("filtreValeur")),
         );
      }
   }, [searchParams]);

   useEffect(() => {
      if (auth.impersonate && hasImpersonate) {
         queryClient.clear();
         dispatch(
            setAffichageFiltres(initialAffichageFiltres.affichage, initialAffichageFiltres.filtres),
         );
      }
   }, [hasImpersonate, auth.impersonate, dispatch]);

   useEffect(() => {
      setCount(dataDemandes?.totalItems);
   }, [dataDemandes]);

   // Sticky header
   useEffect(() => {
      function handleScroll() {
         const table = document.querySelector("table") as HTMLElement;
         const tHead = document.querySelector(".ant-table-thead") as HTMLElement;
         tHead.style.top = `${document.documentElement.scrollTop - (table.getBoundingClientRect().top + window.scrollY - 80)}px`;
      }

      window.addEventListener("scroll", handleScroll);
      return () => {
         window.removeEventListener("scroll", handleScroll);
      };
   }, []);

   return (
      <>
         <DemandeTableFilters
            filtreDemande={filtreDemande}
            setFiltreDemande={setFiltreDemande}
            defaultFilter={FILTRE_DEMANDE_DEFAULT}
            refs={props.refs}
            affichageTour={props.affichageTour}
         />
         <Flex justify="space-between" align="center">
            <span className="legende">{getCountLibelle(count, "demande")}</span>
            <div>
               {JSON.stringify(FILTRE_DEMANDE_DEFAULT) !== JSON.stringify(filtreDemande) && (
                  <Button.Group>
                     <FiltreDescription
                        filtre={filtreDemande}
                        as="modal"
                        tooltip="Décrire le filtre en cours"
                     />
                     <Tooltip title="Retirer les filtres">
                        <Button
                           className="d-flex-inline-center mr-1"
                           icon={<Icon component={Unfilter} aria-label="Retirer les filtres" />}
                           onClick={() => setFiltreDemande(FILTRE_DEMANDE_DEFAULT)}
                        />
                     </Tooltip>
                  </Button.Group>
               )}
               <DemandeTableExport filtreDemande={filtreDemande} />
            </div>
         </Flex>
         <div ref={props.refs.table}>
            <Table<IDemande>
               loading={isFetchingDemandes}
               dataSource={dataDemandes?.items || []}
               className="table-responsive table-thead-sticky mt-2"
               rowClassName={(_record, index) => (index % 2 === 1 ? "bg-grey-xlight" : "")}
               rowHoverable={false}
               style={props.affichageTour ? { maxHeight: 400, overflowY: "auto" } : undefined}
               pagination={{
                  pageSize: filtreDemande.itemsPerPage,
                  total: dataDemandes?.totalItems,
                  current: filtreDemande.page,
                  showTotal: (total, range) => (
                     <div className="text-legende mr-1">
                        {range[0]} à {range[1]} / {total}
                     </div>
                  ),
                  showSizeChanger: true,
                  pageSizeOptions: [25, 50, 100, 200],
               }}
               rowKey={(record) => record["@id"] as string}
               columns={demandeTableColumns({
                  filter: filtreDemande,
                  setFilter: setFiltreDemande,
                  user: auth.user,
                  etats: etats?.items,
                  onImpersonate: (uid) => {
                     navigate("/");
                     window.setTimeout(() => {
                        setHasImpersonate(true);
                        auth.setImpersonate(uid);
                     }, 500);
                  },
                  onDemandeSelected: (demande: IDemande) => {
                      navigate(`/demandes/${demande.id}` as string);
                  },
               })}
               onChange={(
                  pagination,
                  _filters,
                  sorter: SorterResult<IDemande> | SorterResult<IDemande>[],
               ) => {
                  if (Array.isArray(sorter)) {
                     // Ne devrait pas arriver
                     setFiltreDemande((prev) => ({
                        ...prev,
                        page: pagination.current ?? prev.page,
                        itemsPerPage: pagination.pageSize ?? prev.itemsPerPage,
                     }));
                  } else if (sorter.field && sorter.field === "demandeur.nom") {
                     setFiltreDemande((prev) => ({
                        ...prev,
                        "order[demandeur.nom]": ascendToAsc(sorter.order),
                        "order[dateDepot]": undefined,
                        page: pagination.current ?? prev.page,
                        itemsPerPage: pagination.pageSize ?? prev.itemsPerPage,
                     }));
                  } else if (sorter.field && sorter.field === "dateDepot") {
                     setFiltreDemande((prev) => ({
                        ...prev,
                        "order[dateDepot]": ascendToAsc(sorter.order),
                        "order[demandeur.nom]": undefined,
                        page: pagination.current ?? prev.page,
                        itemsPerPage: pagination.pageSize ?? prev.itemsPerPage,
                     }));
                  }
               }}
            />
         </div>
      </>
   );
}
