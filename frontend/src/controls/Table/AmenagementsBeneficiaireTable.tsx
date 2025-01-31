/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
   IAmenagementsBenefificiaire,
   ICategorieAmenagement,
   IFormation, IInscription,
   ITypeAmenagement,
} from "../../api/ApiTypeHelpers";
import { useApi } from "../../context/api/ApiProvider";
import React, { useEffect, useMemo } from "react";
import { FiltreAmenagement, filtreAmenagementToApi } from "./AmenagementTableLayout";
import { Table } from "antd";
import { DomaineAmenagementInfos, getDomaineAmenagement } from "../../lib/amenagements";
import { amenagementsBeneficiaireTableColumns } from "./AmenagementsBeneficiaireTableColumns";
import { useNavigate } from "react-router-dom";
import { ModeAffichageAmenagement } from "../../routes/gestionnaire/beneficiaires/Amenagements";
import { useAuth } from "../../auth/AuthProvider";
import { Utilisateur } from "../../lib/Utilisateur";

export type TypesDomainesAmenagements = {
   typeAmenagement: ITypeAmenagement;
   domaine: DomaineAmenagementInfos;
};

export type AmenagementCellData = {
   "@id": string;
   commentaire: string | null;
};

export function buildAmenagementsBenefDatasource(
   abs: IAmenagementsBenefificiaire[],
   typesAmenagementsUtilises: TypesDomainesAmenagements[],
): any[] {
   return abs.map((rd) => {
      const data: {
         key: string;
         nom: string;
         prenom: string;
         email: string;
         numeroEtudiant: number | null | undefined;
         etatAvisEse: string | undefined;
         inscription: IInscription | undefined;
         tags?: string[];
      } = {
         key: rd["@id"] as string,
         nom: rd.nom as string,
         prenom: rd.prenom as string,
         email: rd.email as string,
         numeroEtudiant: rd.numeroEtudiant,
         etatAvisEse: rd.etatAvisEse,
         tags: rd.tags || [],
         inscription:
            rd.inscriptions && rd.inscriptions.length > 0
               ? {
                    formation: rd.inscriptions[0].formation as IFormation,
                    debut: rd.inscriptions[0].debut,
                    fin: rd.inscriptions[0].fin,
                 }
               : undefined,
      };

      typesAmenagementsUtilises.forEach((ta) => {
         const a = rd.amenagements?.find(
            (r) => r.typeAmenagement?.["@id"] === ta.typeAmenagement?.["@id"],
         );
         if (a) {
            // @ts-ignore
            data[ta.typeAmenagement?.["@id"] as string] = {
               "@id": a?.["@id"],
               commentaire: a?.commentaire,
            };
         }
      });

      return data;
   });
}

export function getTypesAmenagements(
   abs: IAmenagementsBenefificiaire[],
   typesAmenagements?: ITypeAmenagement[],
): TypesDomainesAmenagements[] {
   return abs
      .map((ab) => ab.amenagements)
      .flat()
      .map((a) => a?.typeAmenagement?.["@id"])
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((ta) => {
         const typeAmenagement = typesAmenagements?.find((t) => t["@id"] === ta);
         return {
            typeAmenagement: typeAmenagement as ITypeAmenagement,
            domaine: getDomaineAmenagement(typeAmenagement) as DomaineAmenagementInfos,
         };
      });
}

export function AmenagementsBeneficiaireTable(props: {
   filtreAmenagement: FiltreAmenagement;
   setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
   typesAmenagements?: ITypeAmenagement[];
   categoriesAmenagements?: ICategorieAmenagement[];
   setCount?: (count: number | undefined) => void;
}) {
   const user = useAuth().user;
   const navigate = useNavigate();
   const { data: amenagements, isFetching } = useApi().useGetCollection({
      path: "/amenagements/utilisateurs",
      query: filtreAmenagementToApi(
         props.filtreAmenagement,
         ModeAffichageAmenagement.ParBeneficiaire,
      ),
   });

   const typesAmenagementsUtilises = useMemo(
      () => {
         return getTypesAmenagements(amenagements?.items || [], props.typesAmenagements).sort(
            (a, b) => a.typeAmenagement?.libelle.localeCompare(b.typeAmenagement?.libelle),
         );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [amenagements?.items, props.typesAmenagements],
   );

   const dataSource = useMemo(
      () => {
         return buildAmenagementsBenefDatasource(
            amenagements?.items || [],
            typesAmenagementsUtilises,
         );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [amenagements?.items, typesAmenagementsUtilises],
   );

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

   useEffect(() => {
      if (props.setCount) {
         props.setCount(amenagements?.totalItems);
      }
   }, [amenagements, props]);

   return (
      <>
         <Table
            loading={isFetching}
            className="table-responsive table-thead-sticky mt-2"
            rowKey={(record: any) => record.key as string}
            rowHoverable={false}
            dataSource={dataSource}
            pagination={{
               pageSize: props.filtreAmenagement.itemsPerPage || 50,
               total: amenagements?.totalItems,
               current: props.filtreAmenagement.page || 1,
               showTotal: (total, range) => (
                  <div className="text-legende mr-1">
                     {range[0]} à {range[1]} / {total}
                  </div>
               ),
               showSizeChanger: true,
               pageSizeOptions: [25, 50, 100, 200],
            }}
            onChange={(pagination) => {
               props.setFiltreAmenagement({
                  ...props.filtreAmenagement,
                  page: pagination.current ?? 1,
                  itemsPerPage: pagination.pageSize ?? 25,
               });
            }}
            columns={amenagementsBeneficiaireTableColumns({
               filtre: props.filtreAmenagement,
               setFiltre: props.setFiltreAmenagement,
               typesAmenagements: typesAmenagementsUtilises,
               categoriesAmenagements: props.categoriesAmenagements || [],
               navigate: navigate,
               user: user as Utilisateur,
            })}
         />
      </>
   );
}
