/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Checkbox, Form } from "antd";
import React, { ReactElement } from "react";
import { useApi } from "@context/api/ApiProvider";
import { Utilisateur } from "@lib";
import { PREFETCH_TYPES_EVENEMENTS } from "@api";

interface ITabTypesEvenementsProps {
  utilisateur: Utilisateur;
  setUtilisateur: (utilisateur: Utilisateur) => void;
}

/**
 * Updates the categories of events supported by the beneficiary.
 *
 * @param {Object} props - The component props.
 * @param {Utilisateur} props.utilisateur - The current user object.
 * @param {function} props.setUtilisateur - The function to set the updated user object.
 *
 * @return {ReactElement} - The JSX code to render the component.
 */
export function TabTypesEvenements({
  utilisateur,
  setUtilisateur,
}: ITabTypesEvenementsProps): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  return (
    <>
      <p className="semi-bold">Catégories d'évènements prises en charge par ce bénéficiaire</p>
      <div className="text-right">
        <Button
          type="link"
          size="small"
          onClick={() => {
            setUtilisateur(
              new Utilisateur({
                ...utilisateur,
                typesEvenements:
                  data?.items.filter((c) => c.actif).map((item) => item["@id"] as string) ?? [],
              }),
            );
          }}
        >
          Tous
        </Button>
        <span>/</span>
        <Button
          type="link"
          size="small"
          onClick={() => {
            setUtilisateur(
              new Utilisateur({
                ...utilisateur,
                typesEvenements: [],
              }),
            );
          }}
        >
          Aucun
        </Button>
      </div>
      <Form.Item name="typesEvenements">
        <Checkbox.Group
          onChange={(checkedValues) => {
            setUtilisateur(
              new Utilisateur({
                ...utilisateur,
                typesEvenements: checkedValues as string[],
              }),
            );
          }}
          value={utilisateur.typesEvenements}
          className="checkbox-group-vertical"
          options={data?.items
            .filter((c) => c.actif)
            .map((item) => ({
              label: item.libelle,
              value: item["@id"] as string,
            }))}
        />
      </Form.Item>
    </>
  );
}
