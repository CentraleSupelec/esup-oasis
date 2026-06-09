/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { Button, Dropdown, MenuProps, Modal } from "antd";
import { ExportOutlined, EyeOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ServicesFaitsItem } from "@controls/Admin/Bilans/ServicesFaitsItem";
import { useAuth } from "@/auth/AuthProvider";
import apiDownloader from "@utils/apiDownloader";
import dayjs from "dayjs";
import { IPeriode } from "@api";
import { env } from "@/env";

interface ServicesFaitsButtonProps {
  label?: string;
  periode: IPeriode;
  showAfficher?: boolean;
}

/**
 * Displays a button to download or view services faits.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.label] - The button label. Default value is "Services faits".
 * @param {IPeriode} props.periode - The periode object.
 * @param {boolean} [props.showAfficher] - Whether to show the "Consulter en ligne" option or not.
 *
 * @return {ReactElement} - The ServicesFaitsButton component.
 */
export function ServicesFaitsButton({
  label = "Services faits",
  periode,
  showAfficher,
}: ServicesFaitsButtonProps): ReactElement {
  const auth = useAuth();
  const [modale, setModale] = useState(false);

  function fetchServicesFaits(accept: string, extension: string) {
    apiDownloader(
      `${env.REACT_APP_API}${periode["@id"]}/services_faits`,
      auth,
      {
        Accept: accept,
      },
      `${env.REACT_APP_TITRE?.toLocaleUpperCase()}_ServicesFaits_${dayjs(periode.debut).format(
        "YYYY-MM-DD",
      )}_${dayjs(periode.fin).format("YYYY-MM-DD")}.${extension}`,
    ).then();
  }

  const itemsMenu: MenuProps["items"] = [
    {
      key: "csv",
      label: "Excel (CSV)",
      icon: <FileExcelOutlined />,
      onClick: () => fetchServicesFaits("text/csv", "csv"),
    },
    {
      key: "pdf",
      label: "PDF",
      icon: <FilePdfOutlined />,
      onClick: () => fetchServicesFaits("application/pdf", "pdf"),
    },
    showAfficher
      ? {
          key: "divider",
          type: "divider",
        }
      : null,
    showAfficher
      ? {
          key: "html",
          label: "Consulter en ligne",
          icon: <EyeOutlined />,
          onClick: () => setModale(true),
        }
      : null,
  ];

  return (
    <>
      <Dropdown menu={{ items: itemsMenu }}>
        <Button icon={<ExportOutlined />}>{label}</Button>
      </Dropdown>
      {modale && (
        <Modal
          title={<>Services faits de la période</>}
          width="80%"
          open
          onCancel={() => setModale(false)}
          footer={<Button onClick={() => setModale(false)}>Fermer</Button>}
        >
          <ServicesFaitsItem periode={periode} />
        </Modal>
      )}
    </>
  );
}
