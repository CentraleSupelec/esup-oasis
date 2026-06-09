/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import React, { ReactElement, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { EnterOutlined } from "@ant-design/icons";
import { RoleValues, Utilisateur } from "@lib";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { env } from "@/env";

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
    enabled: recherche.length > 1 && env.REACT_APP_GERER_DEMANDES,
  });

  const options = useMemo(() => {
    const result = [];

    // Loading state
    if (isFetchingBeneficiaire && isFetchingIntervenant) {
      result.push({
        key: "loading",
        value: "loading",
        label: <Spin size="small" />,
        disabled: true,
      });
    }

    // Bénéficiaires group
    if (value === recherche && (beneficiaires?.items.length || 0) > 0) {
      result.push({
        label: "Bénéficiaires",
        key: "beneficiaires",
        options: beneficiaires?.items.map((beneficiaire) => ({
          key: `beneficiaire§${beneficiaire.uid}`,
          value: `beneficiaire§${beneficiaire.uid}`,
          label: (
            <EtudiantItem
              utilisateur={beneficiaire}
              role={RoleValues.ROLE_BENEFICIAIRE}
              highlight={recherche}
            />
          ),
        })),
      });
    }

    // Intervenants group
    if (value === recherche && (intervenants?.items.length || 0) > 0) {
      result.push({
        label: "Intervenants",
        key: "intervenants",
        options: intervenants?.items.map((intervenant) => ({
          key: `intervenant§${intervenant.uid}`,
          value: `intervenant§${intervenant.uid}`,
          label: (
            <EtudiantItem
              utilisateur={intervenant}
              role={RoleValues.ROLE_INTERVENANT}
              highlight={recherche}
            />
          ),
        })),
      });
    }

    // Demandeurs group
    if (value === recherche && (demandeurs?.items.length || 0) > 0) {
      result.push({
        label: "Demandeurs",
        key: "demandeurs",
        options: demandeurs?.items.map((demandeur) => ({
          key: `demandeur§${demandeur.uid}`,
          value: `demandeur§${demandeur.uid}`,
          label: (
            <EtudiantItem
              utilisateur={demandeur}
              role={RoleValues.ROLE_DEMANDEUR}
              highlight={recherche}
            />
          ),
        })),
      });
    }

    // No results
    if (
      value === recherche &&
      intervenants &&
      (intervenants.items.length || 0) === 0 &&
      demandeurs &&
      (demandeurs.items.length || 0) === 0 &&
      beneficiaires &&
      (beneficiaires.items.length || 0) === 0
    ) {
      result.push({
        key: "empty",
        value: "empty",
        label: "Aucun résultat",
        disabled: true,
      });
    }

    // Enter prompt
    if (value !== recherche && value.length > 1) {
      result.push({
        key: "empty",
        value: "empty",
        label: (
          <>
            <EnterOutlined /> pour lancer la recherche
          </>
        ),
        disabled: true,
      });
    }

    return result;
  }, [
    value,
    recherche,
    beneficiaires,
    intervenants,
    demandeurs,
    isFetchingBeneficiaire,
    isFetchingIntervenant,
  ]);

  return (
    <Select
      open={open}
      autoFocus
      allowClear={value === recherche}
      showSearch={{
        filterOption: false,
        onSearch: (term) => {
          setValue(term);
        },
      }}
      suffix={
        value !== recherche && value.length > 1 ? (
          <EnterOutlined className="fs-08 p-0 m-0 text-text" />
        ) : (
          <></>
        )
      }
      placeholder="Rechercher..."
      className={className}
      loading={isFetchingBeneficiaire || isFetchingIntervenant || isFetchingDemandeurs}
      notFoundContent={null}
      listHeight={400}
      style={style}
      showAction={["focus"]}
      onClear={() => {
        setValue("");
        setRecherche("");
        setOpen(false);
        onSelect(undefined, undefined);
      }}
      onInputKeyDown={(e) => {
        setOpen(true);
        if (e.key === "Enter") {
          e.preventDefault();
          setRecherche(value);
        }
      }}
      styles={{ popup: { root: { minWidth: 400 } } }}
      onSelect={(selectedItem: string, option: { key: string }) => {
        if (selectedItem) {
          let role = RoleValues.ROLE_BENEFICIAIRE;
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
      options={options}
    />
  );
}
