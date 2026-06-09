/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useEffect, useState } from "react";
import { FormInstance } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { useDrawers } from "@context/drawers/DrawersContext";
import { RoleValues, Utilisateur } from "@lib";

/**
 * Gère l'état du drawer utilisateur : lecture du contexte drawers, fetch API,
 * hydratation de l'objet Utilisateur et synchronisation avec le formulaire.
 * Isolé ici car ces quatre effets forment un pipeline de synchronisation cohérent.
 */
export function useUtilisateurDrawerState(id: string | undefined, form: FormInstance<Utilisateur>) {
  const [role, setRole] = useState<RoleValues>();
  const [utilisateurId, setUtilisateurId] = useState(id);
  const [utilisateur, setUtilisateur] = useState<Utilisateur>();
  const { drawers } = useDrawers();

  const { data, isFetching } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: utilisateurId as string,
    enabled: !!utilisateurId,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) setUtilisateurId(drawers.UTILISATEUR);
  }, [id, drawers.UTILISATEUR]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!id) setRole(drawers.UTILISATEUR_ROLE);
  }, [id, drawers.UTILISATEUR_ROLE]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data) setUtilisateur(new Utilisateur(data));
  }, [data]);

  useEffect(() => {
    form.resetFields();
    if (utilisateur) form.setFieldsValue(utilisateur);
  }, [form, utilisateur]);

  return { role, utilisateur, setUtilisateur, data, isFetching };
}
