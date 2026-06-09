/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { Button, Input, Select, Space, Tooltip } from "antd";
import { EnterOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useDrawers } from "@context/drawers/DrawersContext";
import { RoleApi, RoleValues } from "@lib";
import Spinner from "@controls/Spinner/Spinner";

import { IUtilisateur } from "@api";
import { MailSmallButton } from "@controls/Forms/MailSmallButton";
import { useUtilisateurSearch } from "@controls/Forms/useUtilisateurSearch";

interface IUtilisateurFormItemSelect {
  value?: string;
  onChange?: (v: string | undefined) => void;
  onSelect?: (v: string | undefined) => void;
  style?: React.CSSProperties;
  styleButton?: React.CSSProperties;
  className?: string;
  classNameButton?: string;
  disabled?: boolean;
  placeholder?: string;
  intervenantArchive?: boolean;
  existeNumeroEtudiant?: boolean;
  forcerRechercheGlobale?: boolean;
  roleUtilisateur?:
    | RoleValues.ROLE_INTERVENANT
    | RoleValues.ROLE_BENEFICIAIRE
    | RoleValues.ROLE_RENFORT
    | RoleValues.ROLE_ENSEIGNANT
    | RoleValues.ROLE_REFERENT_COMPOSANTE;
}

function UtilisateurSelectEditing({
  utilisateursTrouves,
  isFetchingUtilisateursTrouves,
  itemsPerPage,
  forcerRechercheGlobale,
  roleUtilisateur,
  className,
  style,
  open,
  tappedSearch,
  setTappedSearch,
  search,
  launchSearch,
  placeholder,
  onSelect,
  onChange,
}: {
  utilisateursTrouves: { items: IUtilisateur[] } | undefined;
  isFetchingUtilisateursTrouves: boolean;
  itemsPerPage: number;
  forcerRechercheGlobale?: boolean;
  roleUtilisateur?: string;
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  tappedSearch: string;
  setTappedSearch: (v: string) => void;
  search: string;
  launchSearch: () => void;
  placeholder?: string;
  onSelect: (v: string | undefined) => void;
  onChange?: (v: string | undefined) => void;
}) {
  return (
    <Select
      options={utilisateursTrouves?.items
        .filter((u: IUtilisateur) => {
          if (forcerRechercheGlobale && utilisateursTrouves?.items.length === itemsPerPage) {
            return true;
          }
          if (forcerRechercheGlobale) {
            return u.roles?.includes(roleUtilisateur as RoleApi);
          }
          return true;
        })
        .map((b: IUtilisateur) => ({
          value: b["@id"],
          label: `${b.nom?.toLocaleUpperCase()} ${b.prenom} (${b.email})`,
        }))}
      loading={isFetchingUtilisateursTrouves}
      showSearch={{
        filterOption: false,
        onSearch: (term) => {
          setTappedSearch(term);
        },
      }}
      className={className}
      style={style}
      open={open && !isFetchingUtilisateursTrouves}
      suffix={
        isFetchingUtilisateursTrouves ? (
          <Spinner size={16} />
        ) : tappedSearch !== search && tappedSearch.length > 1 ? (
          <EnterOutlined
            className="text-primary"
            onClick={(e) => {
              e.preventDefault();
              launchSearch();
            }}
          />
        ) : (
          <></>
        )
      }
      placeholder={placeholder}
      onInputKeyDown={(e) => {
        if (e.key === "Enter" && tappedSearch.length > 1) {
          e.preventDefault();
          launchSearch();
        }
      }}
      onSelect={(v) => onSelect(v as string | undefined)}
      onChange={onChange}
    />
  );
}

function UtilisateurSelectDisplay({
  style,
  className,
  disabled,
  placeholder,
  getSuffix,
  dataUtilisateur,
}: {
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  getSuffix: () => React.ReactNode;
  dataUtilisateur: IUtilisateur | undefined;
}) {
  return (
    <Input
      style={style}
      className={`mb-0 ${className}`}
      disabled={disabled}
      placeholder={placeholder}
      suffix={getSuffix()}
      value={
        dataUtilisateur
          ? `${dataUtilisateur?.prenom} ${dataUtilisateur?.nom?.toLocaleUpperCase()}`
          : ""
      }
      readOnly
    />
  );
}

function UtilisateurFormItemSelect({
  value,
  onSelect,
  onChange,
  style,
  styleButton,
  className,
  classNameButton,
  disabled,
  placeholder,
  roleUtilisateur,
  intervenantArchive,
  existeNumeroEtudiant,
  forcerRechercheGlobale,
}: IUtilisateurFormItemSelect) {
  const utilisateurId = value === "" ? undefined : value;
  const [userWantsToEdit, setUserWantsToEdit] = useState(false);
  const isEditing = !utilisateurId || userWantsToEdit;
  const [open, setOpen] = useState(false);
  const { setDrawerUtilisateur } = useDrawers();

  const {
    tappedSearch,
    setTappedSearch,
    search,
    setSearch,
    itemsPerPage,
    dataUtilisateur,
    isFetchingUtilisateur,
    utilisateursTrouves,
    isFetchingUtilisateursTrouves,
  } = useUtilisateurSearch({
    utilisateurId,
    roleUtilisateur,
    intervenantArchive,
    existeNumeroEtudiant,
  });

  function launchSearch() {
    if (tappedSearch.length > 1) {
      setOpen(true);
      setSearch(tappedSearch);
    }
  }

  function getSuffix() {
    if (isFetchingUtilisateur) return <Spinner />;

    function getUtilisateurColor() {
      switch (roleUtilisateur) {
        case RoleValues.ROLE_BENEFICIAIRE:
          return "bg-beneficiaire border-beneficiaire";
        case RoleValues.ROLE_INTERVENANT:
          return "bg-intervenant border-intervenant";
        default:
          return "";
      }
    }

    return utilisateurId ? (
      <Space>
        <MailSmallButton utilisateur={dataUtilisateur} />
        <Tooltip title="Voir le profil">
          <Button
            size="small"
            icon={<UserOutlined />}
            shape="circle"
            className={`m-0 p-0 ${classNameButton} text-text ${getUtilisateurColor()}}`}
            style={styleButton}
            onClick={() => {
              setDrawerUtilisateur({
                utilisateur: dataUtilisateur?.["@id"] as string,
                role: roleUtilisateur,
              });
            }}
          />
        </Tooltip>
      </Space>
    ) : (
      <Button
        size="small"
        icon={<SearchOutlined />}
        shape="circle"
        className={`m-0 p-0 ${classNameButton}`}
        style={styleButton}
        onClick={() => {
          setUserWantsToEdit(true);
        }}
      />
    );
  }

  if (isEditing) {
    return (
      <UtilisateurSelectEditing
        utilisateursTrouves={utilisateursTrouves}
        isFetchingUtilisateursTrouves={isFetchingUtilisateursTrouves}
        itemsPerPage={itemsPerPage}
        forcerRechercheGlobale={forcerRechercheGlobale}
        roleUtilisateur={roleUtilisateur}
        className={className}
        style={style}
        open={open}
        tappedSearch={tappedSearch}
        setTappedSearch={setTappedSearch}
        search={search}
        launchSearch={launchSearch}
        placeholder={placeholder}
        onSelect={(v) => {
          setOpen(false);
          if (onSelect) onSelect(v);
          setUserWantsToEdit(false);
        }}
        onChange={onChange}
      />
    );
  }

  return (
    <UtilisateurSelectDisplay
      style={style}
      className={className}
      disabled={disabled}
      placeholder={placeholder}
      getSuffix={getSuffix}
      dataUtilisateur={dataUtilisateur}
    />
  );
}

export default UtilisateurFormItemSelect;
