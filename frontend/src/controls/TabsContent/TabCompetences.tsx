/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Checkbox, Form } from "antd";
import React, { ReactElement } from "react";
import { useApi } from "@context/api/ApiProvider";
import { Utilisateur } from "@lib";
import { PREFETCH_COMPETENCES } from "@api";

interface ITabCompetencesProps {
  label: string;
  utilisateur: Utilisateur;
  setUtilisateur: (utilisateur: Utilisateur) => void;
}

/**
 * Renders a checkbox group of competences for a form item.
 * @param {ITabCompetencesProps} props - The props object.
 * @param {string} props.label - The label for the tab.
 * @param {Utilisateur} props.utilisateur - The utilisateur object.
 * @param {function} props.setUtilisateur - The callback function for updating the utilisateur object.
 * @returns {ReactElement} - The rendered tab component.
 */
export function TabCompetences({
  label,
  utilisateur,
  setUtilisateur,
}: ITabCompetencesProps): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_COMPETENCES);

  return (
    <>
      <p className="semi-bold">{label}</p>
      <Form.Item name="competences">
        <Checkbox.Group
          className="checkbox-group-vertical"
          options={data?.items.map((item) => ({
            label: item.libelle,
            value: item["@id"] as string,
            disabled: !item.actif,
          }))}
          onChange={(checkedValues) => {
            setUtilisateur(
              new Utilisateur({
                ...utilisateur,
                competences: checkedValues as string[],
              }),
            );
          }}
          value={utilisateur.competences}
        />
      </Form.Item>
    </>
  );
}
