/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

import React, { ReactElement, useState } from "react";
import { Select, Spin } from "antd";
import { useApi } from "../../../context/api/ApiProvider";
import { EnterOutlined } from "@ant-design/icons";
import { RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import EtudiantItem from "../../Items/EtudiantItem";

interface IBeneficiaireIntervenantSearchProps {
   onSelect: (
      value?: string,
      type?: RoleValues.ROLE_INTERVENANT | RoleValues.ROLE_BENEFICIAIRE | RoleValues.ROLE_DEMANDEUR,
   ) => void;
   className?: string;
   style?: React.CSSProperties;
   utilisateur: Utilisateur;
}

/**
 * A searchable dropdown component used for selecting a beneficiary or an intervenor by name.
 *
 * @param {Object} props - The props object.
 * @param {function} props.onSelect - The callback function called when an item is selected.
 * @param {string} [props.className] - The CSS class to apply to the dropdown.
 * @param {Object} [props.style] - The inline CSS styles to apply to the dropdown.
 *
 * @returns {ReactElement} - The rendered Select component.
 */
export default function BeneficiaireIntervenantSearchDrawer({
   onSelect,
   className,
   style,
}: IBeneficiaireIntervenantSearchProps): ReactElement {
   const [value, setValue] = useState("");
   const [open, setOpen] = useState(false);
   const [recherche, setRecherche] = useState("");
   const { data: beneficiaires, isFetching: isFetchingBeneficiaire } = useApi().useGetCollection({
      path: "/beneficiaires",
      query: {
         recherche,
      },
      enabled: recherche.length > 1,
   });
   const { data: intervenants, isFetching: isFetchingIntervenant } = useApi().useGetCollection({
      path: "/intervenants",
      query: {
         recherche,
      },
      enabled: recherche.length > 1,
   });
   const { data: demandeurs, isFetching: isFetchingDemandeurs } = useApi().useGetCollection({
      path: "/roles/{roleId}/utilisateurs",
      query: {
         recherche,
      },
      parameters: {
         roleId: `/roles/${RoleValues.ROLE_DEMANDEUR}`,
      },
      enabled: recherche.length > 1,
   });

   return (
      <Select
         open={open}
         autoFocus
         allowClear={value === recherche}
         showSearch
         classNames={{ input: "form-control fs-1" }}
         suffixIcon={
            value !== recherche && value.length > 1 ? (
               <EnterOutlined className="text-text fs-08 p-0 m-0" />
            ) : null
         }
         placeholder="Rechercher..."
         className={className}
         loading={isFetchingBeneficiaire || isFetchingIntervenant || isFetchingDemandeurs}
         notFoundContent={null}
         filterOption={false}
         listHeight={400}
         style={style}
         showAction={["focus"]}
         onClear={() => {
            setValue("");
            setRecherche("");
            setOpen(false);
            onSelect(undefined, undefined);
         }}
         onSearch={(term) => {
            setValue(term);
         }}
         onInputKeyDown={(e) => {
            setOpen(true);
            if (e.key === "Enter") {
               e.preventDefault();
               setRecherche(value);
            }
         }}
         dropdownStyle={{ minWidth: 400 }}
         onSelect={(selectedItem: string, option) => {
            if (selectedItem) {
               let role = RoleValues.ROLE_BENEFICIAIRE;
               // @ts-ignore
               if (option.key.split("§")[0] === "intervenant") {
                  role = RoleValues.ROLE_INTERVENANT;
               } else if (option.key.split("§")[0] === "demandeur") {
                  role = RoleValues.ROLE_DEMANDEUR;
               }
               setOpen(false);
               onSelect(selectedItem.split("§")[1], role);
            }
            setRecherche(value);
         }}
         defaultActiveFirstOption={false}
      >
         {isFetchingBeneficiaire && isFetchingIntervenant && (
            <Select.Option key="loading" value="loading" disabled>
               <Spin size="small" />
            </Select.Option>
         )}
         {value === recherche && (beneficiaires?.items.length || 0) > 0 && (
            <Select.OptGroup key="beneficiaires" label="Bénéficiaires">
               {beneficiaires?.items.map((beneficiaire) => (
                  <Select.Option
                     key={`beneficiaire§${beneficiaire.uid}`}
                     value={`beneficiaire§${beneficiaire.uid}`}
                  >
                     <EtudiantItem
                        utilisateur={beneficiaire}
                        role={RoleValues.ROLE_BENEFICIAIRE}
                        highlight={recherche}
                     />
                  </Select.Option>
               ))}
            </Select.OptGroup>
         )}
         {value === recherche && (intervenants?.items.length || 0) > 0 && (
            <Select.OptGroup key="intervenants" label="Intervenants">
               {intervenants?.items.map((intervenant) => (
                  <Select.Option
                     key={`intervenant§${intervenant.uid}`}
                     value={`intervenant§${intervenant.uid}`}
                  >
                     <EtudiantItem
                        utilisateur={intervenant}
                        role={RoleValues.ROLE_INTERVENANT}
                        highlight={recherche}
                     />
                  </Select.Option>
               ))}
            </Select.OptGroup>
         )}
         {value === recherche && (demandeurs?.items.length || 0) > 0 && (
            <Select.OptGroup key="demandeurs" label="Demandeurs">
               {demandeurs?.items.map((demandeur) => (
                  <Select.Option
                     key={`demandeur§${demandeur.uid}`}
                     value={`demandeur§${demandeur.uid}`}
                  >
                     <EtudiantItem
                        utilisateur={demandeur}
                        role={RoleValues.ROLE_DEMANDEUR}
                        highlight={recherche}
                     />
                  </Select.Option>
               ))}
            </Select.OptGroup>
         )}
         {value === recherche &&
            intervenants &&
            (intervenants.items.length || 0) === 0 &&
            demandeurs &&
            (demandeurs.items.length || 0) === 0 &&
            beneficiaires &&
            (beneficiaires.items.length || 0) === 0 && (
               <Select.Option key="empty" value="empty" disabled>
                  Aucun résultat
               </Select.Option>
            )}
         {value !== recherche && value.length > 1 && (
            <Select.Option key="empty" value="empty" disabled>
               <EnterOutlined /> pour lancer la recherche
            </Select.Option>
         )}
      </Select>
   );
}
