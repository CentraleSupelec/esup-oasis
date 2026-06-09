/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Button, Col, Typography } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import EtudiantSyncEvtImage from "@controls/Images/EtudiantSyncEvtImage";
import { env } from "@/env";

/**
 * Renders the synchronization section of the user profile.
 *
 * @returns {ReactElement} The rendered synchronization section.
 */
export function MonProfilSynchro(): ReactElement {
  if (!env.REACT_APP_URL_SERVICE_SYNCHRO) return <></>;

  return (
    <>
      <Col xs={0} xl={9}>
        <EtudiantSyncEvtImage className="mt-2" style={{ width: "100%", maxHeight: 380 }} />
      </Col>
      <Col xl={15} xs={24}>
        <Typography.Title level={2}>Synchronisation</Typography.Title>
        <div>
          <div className="mb-3">
            Récupérer les évènements de l'application{" "}
            <Typography.Text className="text-primary semi-bold">
              {env.REACT_APP_TITRE}
            </Typography.Text>{" "}
            sur votre téléphone, dans Zimbra,&nbsp;...
          </div>
          <div className="text-center">
            <Button
              icon={<SyncOutlined />}
              href={env.REACT_APP_URL_SERVICE_SYNCHRO}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noreferrer"
              size="large"
              className="button-multiline m-auto"
              style={{
                maxWidth: "400px",
              }}
              aria-label={`Utiliser ${env.REACT_APP_NOM_SERVICE_SYNCHRO} pour synchroniser vos évènements. Ce bouton vous redirigera vers le site de ${env.REACT_APP_NOM_SERVICE_SYNCHRO}.`}
            >
              Utiliser {env.REACT_APP_NOM_SERVICE_SYNCHRO} pour synchroniser vos évènements
            </Button>
            {env.REACT_APP_GUIDE_SERVICE_SYNCHRO && (
              <Button
                href={env.REACT_APP_GUIDE_SERVICE_SYNCHRO}
                target="_blank"
                rel="noreferrer"
                className="mt-3"
                type="link"
              >
                Mode d'emploi
              </Button>
            )}
          </div>
        </div>
      </Col>
    </>
  );
}
