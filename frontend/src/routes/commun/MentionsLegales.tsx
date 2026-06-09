/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Card, Col, Layout, Row, Skeleton, Typography } from "antd";
import PageTitle from "@utils/PageTitle/PageTitle";
import { env } from "@/env";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useEffectiveTheme } from "@utils/theme/useEffectiveTheme";

/**
 * Page des mentions légales.
 *
 * Le contenu de la section "Mentions légales" est chargé depuis /mentions-legales.html,
 * un fichier statique monté via volume Docker (voir docker-compose.yml).
 * Si le fichier est absent, un message d'information est affiché à la place.
 */
export default function MentionsLegales() {
  const [mentionsHtml, setMentionsHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isDark = useEffectiveTheme() === "dark";

  useEffect(() => {
    fetch("/mentions-legales.html")
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then(setMentionsHtml)
      .catch(() => setMentionsHtml(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <PageTitle />
      <Layout.Content style={{ padding: 50 }}>
        <h1>Mentions légales et crédits</h1>
        <Card title={<h2>Mentions légales</h2>} className="mb-3">
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : mentionsHtml ? (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mentionsHtml) }} />
          ) : (
            <Typography.Text type="secondary" italic>
              Les mentions légales de l'application n'ont pas encore été renseignées, veuillez vous
              reporter aux mentions légales du site de l'établissement.
            </Typography.Text>
          )}
        </Card>
        <Card title={<h2>Crédits</h2>} className="mb-3">
          <Row>
            {env.REACT_APP_LOGO && (
              <Col md={8}>
                <a
                  href={env.REACT_APP_ETABLISSEMENT_URL as string}
                  target="_blank"
                  rel="noreferrer"
                  referrerPolicy="no-referrer"
                >
                  <img
                    src={
                      isDark && env.REACT_APP_LOGO_DARK
                        ? env.REACT_APP_LOGO_DARK
                        : env.REACT_APP_LOGO
                    }
                    alt="Logo"
                    style={{ height: 100 }}
                  />
                </a>
              </Col>
            )}
            <Col md={8}>
              <a
                href="https://www.esup-portail.org/"
                target="_blank"
                rel="noreferrer"
                referrerPolicy="no-referrer"
              >
                <img src="/images/logo_esup.svg" alt="Logo Esup Portail" style={{ height: 100 }} />
              </a>
            </Col>
            <Col md={8}>
              <a
                href="https://www.u-bordeaux.fr/"
                target="_blank"
                rel="noreferrer"
                referrerPolicy="no-referrer"
              >
                <img
                  src={isDark ? "/images/logo_ub-dark.svg" : "/images/logo_ub.svg"}
                  alt="Logo Université de Bordeaux"
                  style={{ height: 100 }}
                />
              </a>
            </Col>
          </Row>
          <h2>Développement</h2>
          <p>
            Application développée par la Direction des Systèmes d'Information (DSI) de l'
            <a
              href="https://www.u-bordeaux.fr/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
            >
              université de Bordeaux
            </a>{" "}
            pour le Service{" "}
            <a
              href="https://www.u-bordeaux.fr/formation/accompagnement-et-reussite-des-etudes/etudiants-besoins-specifiques"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
            >
              PHASE
            </a>
            .
          </p>
          <h2>Mise à disposition</h2>
          <p>
            Application mise à disposition des établissements d'enseignement supérieur via le
            consortium ESUP (
            <a
              target="_blank"
              referrerPolicy="no-referrer"
              href="https://www.esup-portail.org/"
              rel="noreferrer"
            >
              https://www.esup-portail.org/
            </a>
            ) - Communauté d'établissements français d'enseignement supérieur pour l'innovation
            numérique.
          </p>
          <h2>Licence</h2>
          <p>Licence Apache version 2 (Janvier 2004)</p>
          <h2>Crédits images</h2>
          <p>
            Images mises à disposition par{" "}
            <a
              href="https://www.freepik.com/"
              target="_blank"
              rel="noreferrer"
              referrerPolicy="no-referrer"
            >
              freepik.com
            </a>{" "}
            - Designed by Freepik, adaptées par l'université de Bordeaux.
          </p>
        </Card>
        <div className="text-center">
          <a href="/">Retour à l'accueil</a>
        </div>
      </Layout.Content>
    </Layout>
  );
}
