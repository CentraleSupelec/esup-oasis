/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Anchor, Layout, Typography } from "antd";
import "@routes/administration/Administration.scss";
import { getAdminPanelsByCategorie } from "@routes/administration/AdminConfig";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { env } from "@/env";
import { AnchorLinkItemProps } from "antd/es/anchor/Anchor";

/**
 * Page d'accueil de l'administration.
 *
 * @returns {ReactElement} The rendered Administration component.
 */
export default function Administration(): ReactElement {
  const screens = useBreakpoint();
  const anchors = [
    {
      title: "Utilisateurs",
      className: "fs-09",
      href: "#utilisateurs",
      key: "utilisateurs",
    },
    env.REACT_APP_GERER_DEMANDES
      ? { title: "Demandes", className: "fs-09", href: "#demandes", key: "demandes" }
      : null,
    {
      title: "Bénéficiaires",
      className: "fs-09",
      href: "#beneficiaires",
      key: "beneficiaires",
    },
    {
      title: "Intervenants",
      className: "fs-09",
      href: "#intervenants",
      key: "intervenants",
    },
    {
      title: "Planification",
      className: "fs-09",
      href: "#planification",
      key: "planification",
    },
    {
      title: "Paramètres",
      className: "fs-09",
      href: "#parametres",
      key: "parametres",
    },
  ].filter(Boolean);

  return (
    <Layout.Content className="administration" style={{ padding: "0 50px" }}>
      <Typography.Title level={1}>Administration</Typography.Title>

      {screens.lg && (
        <div
          className="fs-09"
          style={{ position: "fixed", right: 16, top: 100, textAlign: "right" }}
        >
          <div className="semi-bold mb-1">Raccourcis</div>
          <Anchor offsetTop={100} items={anchors as AnchorLinkItemProps[]} />
        </div>
      )}

      <Typography.Title id="utilisateurs" level={2}>
        Utilisateurs
      </Typography.Title>
      <div className="grid-admin">{getAdminPanelsByCategorie("utilisateurs")}</div>

      {env.REACT_APP_GERER_DEMANDES && (
        <>
          <Typography.Title id="demandes" level={2}>
            Demandes
          </Typography.Title>
          <div className="grid-admin">{getAdminPanelsByCategorie("demandes")}</div>
        </>
      )}

      <Typography.Title id="beneficiaires" level={2}>
        Bénéficiaires
      </Typography.Title>
      <div className="grid-admin">{getAdminPanelsByCategorie("bénéficiaires")}</div>

      <Typography.Title id="intervenants" level={2}>
        Intervenants
      </Typography.Title>
      <div className="grid-admin">{getAdminPanelsByCategorie("intervenants")}</div>

      <Typography.Title id="planification" level={2}>
        Planification
      </Typography.Title>
      <div className="grid-admin">
        {getAdminPanelsByCategorie("planification")}
        {getAdminPanelsByCategorie("RH")}
      </div>

      <Typography.Title id="parametres" level={2}>
        Paramètres de l'application
      </Typography.Title>
      <div className="grid-admin">{getAdminPanelsByCategorie("parametres")}</div>
    </Layout.Content>
  );
}
