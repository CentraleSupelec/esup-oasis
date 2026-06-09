/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useCallback, useMemo, useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { useDrawers } from "@context/drawers/DrawersContext";
import { Alert, App, Drawer, Form } from "antd";
import Spinner from "@controls/Spinner/Spinner";
import { getRoleLabel, RoleApi, RoleValues, Utilisateur } from "@lib";
import { useAuth } from "@/auth/AuthProvider";
import { arrayUnique } from "@utils/array";
import {
  QK_BENEFICIAIRES,
  QK_COMPOSANTES,
  QK_INTERVENANTS,
  QK_STATISTIQUES_EVENEMENTS,
  QK_UTILISATEURS,
} from "@api";
import UtilisateurDrawerHeader from "@controls/Drawers/Utilisateur/UtilisateurDrawerHeader";
import UtilisateurDrawerTabs from "@controls/Drawers/Utilisateur/UtilisateurDrawerTabs";
import UtilisateurDrawerFooter from "@controls/Drawers/Utilisateur/UtilisateurDrawerFooter";
import { useUtilisateurDrawerState } from "@controls/Drawers/Utilisateur/useUtilisateurDrawerState";

interface IUtilisateurDrawerProps {
  id?: string;
  onClose?: () => void;
}

export default function UtilisateurDrawer({ id, onClose }: IUtilisateurDrawerProps): ReactElement {
  const [form] = Form.useForm<Utilisateur>();
  const [activeTab, setActiveTab] = useState("informations");
  const auth = useAuth();
  const { setDrawerUtilisateur } = useDrawers();
  const { message } = App.useApp();

  const { role, utilisateur, setUtilisateur, data, isFetching } = useUtilisateurDrawerState(
    id,
    form,
  );

  const currentRole: RoleValues | string | undefined = role ?? utilisateur?.roleCalcule;

  const isBeneficiaireSansProfil = useMemo(
    () =>
      !!utilisateur &&
      currentRole === RoleValues.ROLE_BENEFICIAIRE &&
      (auth.user?.isGestionnaire || false) &&
      (!utilisateur.profils || utilisateur.profils.length === 0),
    [currentRole, auth.user, utilisateur],
  );

  const isIntervenantSansTypeEvenement = useMemo(
    () =>
      !!utilisateur &&
      currentRole === RoleValues.ROLE_INTERVENANT &&
      (!utilisateur.typesEvenements || utilisateur.typesEvenements.length === 0),
    [currentRole, utilisateur],
  );

  const handleClose = useCallback(() => {
    setActiveTab("informations");
    if (onClose) onClose();
    if (!id) setDrawerUtilisateur(undefined);
  }, [id, onClose, setDrawerUtilisateur]);

  const mutateUtilisateur = useApi().usePatch({
    path: "/utilisateurs/{uid}",
    invalidationQueryKeys: [
      QK_UTILISATEURS,
      QK_INTERVENANTS,
      QK_BENEFICIAIRES,
      QK_STATISTIQUES_EVENEMENTS,
      QK_COMPOSANTES,
    ],
    onSuccess: () => {
      message.success("Utilisateur mis à jour").then();
      handleClose();
    },
  });

  if (!data) return <Form form={form} />;
  if (isFetching || !utilisateur)
    return (
      <Form form={form}>
        <Spinner />
      </Form>
    );

  if (currentRole === "intervenant")
    return (
      <Form form={form}>
        <Alert title="Rôle de l'utilisateur inconnu" type="error" />
      </Form>
    );

  return (
    <Drawer
      destroyOnHidden
      title={
        role ? getRoleLabel(currentRole as RoleValues).toLocaleUpperCase() : "PROFIL UTILISATEUR"
      }
      placement="right"
      onClose={handleClose}
      open
      size="large"
      className="oasis-drawer"
    >
      <UtilisateurDrawerHeader utilisateur={utilisateur} />
      <Form<Utilisateur>
        layout="vertical"
        onFinish={(values) => {
          mutateUtilisateur.mutate({
            "@id": utilisateur?.["@id"] as string,
            data: {
              ...{ ...values, nom: undefined, prenom: undefined, email: undefined },
              roles: [...(utilisateur?.roles || []), currentRole as RoleApi]
                .filter((r) => r !== RoleValues.ROLE_DEMANDEUR && r !== "ROLE_USER")
                .filter(arrayUnique),
            },
          });
        }}
        disabled={!auth.user?.isPlanificateur}
        form={form}
      >
        <UtilisateurDrawerTabs
          role={currentRole}
          utilisateur={utilisateur}
          setUtilisateur={setUtilisateur}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          onClose={handleClose}
          data={data}
        />
        <UtilisateurDrawerFooter
          activeTab={activeTab}
          isBeneficiaireSansProfil={isBeneficiaireSansProfil}
          isIntervenantSansTypeEvenement={isIntervenantSansTypeEvenement}
        />
      </Form>
    </Drawer>
  );
}
