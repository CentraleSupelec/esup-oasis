/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useMemo } from "react";
import { App, Button, Dropdown, Tooltip } from "antd";
import { CopyOutlined, MailOutlined, SendOutlined } from "@ant-design/icons";
import { UtilisateurEmailItem } from "@controls/Items/UtilisateurEmailItem";
import { Evenement } from "@lib";
import { MessageInstance } from "antd/es/message/interface";
import { IEvenement } from "@api";

interface EventMailCopyButtonProps {
  evenement: IEvenement | Evenement | undefined;
}

/**
 * Copies the provided email addresses to the clipboard.
 *
 * @param {string} emails - The email addresses to be copied.
 * @param {MessageInstance} message - The message instance for displaying success or error messages.
 * @return {void}
 */
function copyEmail(emails: string, message: MessageInstance) {
  // Copie du mail dans le presse-papier
  navigator.clipboard
    .writeText(emails)
    .then(() => {
      message.success("Emails copiés dans le presse-papier").then();
    })
    .catch(() => {
      message
        .error("Impossible de copier le texte, le navigateur n'a pas accès à votre presse-papier.")
        .then();
    });
}

/**
 * Renders a button for copying or sending emails to participants of an event.
 *
 * @param {object} props - The component props.
 * @param {IEvenement} props.evenement - The event object.
 * @returns {ReactElement} - The rendered button component.
 */
export default function EventMailCopyButton({ evenement }: EventMailCopyButtonProps): ReactElement {
  const { message } = App.useApp();
  const ref = React.useRef<HTMLDivElement>(null);

  return useMemo(() => {
    if (!evenement) return <></>;

    return (
      <>
        <div ref={ref} className="d-none">
          {evenement.beneficiaires?.map((u) => (
            <div key={u}>
              <UtilisateurEmailItem key={u} utilisateurId={u} emailPerso={false} />;
            </div>
          ))}
          {evenement.intervenant && (
            <>
              <UtilisateurEmailItem utilisateurId={evenement.intervenant} emailPerso={false} />;
            </>
          )}
          {evenement.enseignants?.map((u) => (
            <div key={u}>
              <UtilisateurEmailItem key={u} utilisateurId={u} emailPerso={false} />;
            </div>
          ))}
          {evenement.suppleants?.map((u) => (
            <div key={u}>
              <UtilisateurEmailItem key={u} utilisateurId={u} emailPerso={false} />;
            </div>
          ))}
        </div>
        <Tooltip title="Emails des participants">
          <Dropdown
            menu={{
              items: [
                {
                  key: "copier",
                  label: "Copier les adresses email des participants",
                  icon: <CopyOutlined />,
                },
                {
                  key: "envoyer",
                  label: "Envoyer un email aux participants",
                  icon: <SendOutlined />,
                },
              ],
              onClick: (e) => {
                const emails = ref.current?.innerText || "";
                if (e.key === "copier") {
                  copyEmail(emails, message);
                } else if (e.key === "envoyer") {
                  window.open(`mailto:${emails}`);
                }
              },
            }}
          >
            <Button
              size="small"
              shape="round"
              icon={<MailOutlined />}
              aria-label="Copier les adresses email des participants"
              onClick={(e) => {
                e.stopPropagation();
                copyEmail(ref.current?.innerText || "", message);
              }}
            />
          </Dropdown>
        </Tooltip>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evenement]);
}
