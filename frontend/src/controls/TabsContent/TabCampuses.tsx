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
import { PREFETCH_CAMPUS } from "@api";

interface ITabCampus {
  utilisateur: Utilisateur;
  setUtilisateur: (utilisateur: Utilisateur) => void;
}

/**
 * Renders campus checkboxes for a form item.
 * Multiple campuses can be selected.
 *
 * @param {ITabCampus} param - The parameter object.
 * @param {Utilisateur} param.utilisateur - The utilisateur object.
 * @param {function} param.setUtilisateur - The setUtilisateur function.
 * @returns {ReactElement} - The rendered JSX component.
 */
export function TabCampuses({ utilisateur, setUtilisateur }: ITabCampus): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_CAMPUS);

  return (
    <>
      <Form.Item name="campus">
        <Checkbox.Group
          className="checkbox-group-vertical"
          value={utilisateur.campus}
          options={data?.items
            // on ne conserve que les campus actifs ou les campus actifs de l'utilisateur
            .filter((item) => item.actif || utilisateur.campus?.includes(item["@id"] as string))
            .map((item) => ({
              label: item.libelle,
              value: item["@id"] as string,
              disabled: !item.actif,
            }))}
          onChange={(checkedValues) => {
            setUtilisateur(
              new Utilisateur({
                ...utilisateur,
                campus: checkedValues as string[],
              }),
            );
          }}
        />
      </Form.Item>
    </>
  );
}
