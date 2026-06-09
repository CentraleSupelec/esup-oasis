/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { DeleteOutlined, DownloadOutlined, EditOutlined, FileOutlined } from "@ant-design/icons";
import apiDownloader from "@utils/apiDownloader";
import { Button, Flex, Popconfirm, Space, Tooltip } from "antd";
import TelechargementImagePreview from "@controls/Questionnaire/Question/TelechargementImagePreview";
import { env } from "@/env";

export function Fichier(props: {
  fichierId: string;
  onRemove?: (fichierId: string) => void;
  onEdit?: () => void;
  loading?: boolean;
  onlyIcon?: boolean;
  hideDownload?: boolean;
  hideLibelle?: boolean;
}) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const auth = useAuth();

  const { data: fichier, isFetching } = useApi().useGetItem({
    path: "/telechargements/{id}",
    url: props.fichierId,
    enabled: !!props.fichierId,
  });

  function getIcon() {
    if (isFetching) {
      return <Spinner size={16} />;
    } else {
      return <FileOutlined aria-hidden />;
    }
  }

  if (isFetching || props.loading) return <Spinner size={16} />;
  if (!fichier) return null;

  function isImage(typeMime?: string) {
    return typeMime?.startsWith("image/");
  }

  function downloadFile() {
    setDownloading(true);
    apiDownloader(
      `${env.REACT_APP_API}${fichier?.urlContenu}`,
      auth,
      {},
      fichier?.nom,
      () => {
        setDownloading(false);
      },
      () => setDownloading(false),
    ).then();
  }

  return (
    <Flex justify="space-between" align="center" wrap="wrap" className="w-100" gap={16}>
      {!props.hideLibelle && (
        <Space size={12}>
          {getIcon()}
          <Button className="p-0 no-hover" type="text" onClick={() => downloadFile()}>
            {fichier.nom}
          </Button>
        </Space>
      )}
      <Space.Compact>
        {props.onRemove && (
          <Popconfirm
            title="Souhaitez-vous supprimer le fichier ?"
            okText="Oui, supprimer"
            okType="danger"
            cancelText="Non"
            onConfirm={() => {
              setDeleting(true);
              props.onRemove?.(fichier?.["@id"] as string);
            }}
          >
            <Tooltip title="Supprimer" placement="left">
              <Button
                aria-label={`Supprimer la pièce justificative ${fichier.nom}`}
                icon={<DeleteOutlined className="pr-2 pl-2" aria-hidden />}
                loading={deleting}
                className="text-danger border-error-hover"
                style={{ width: "auto" }}
              />
            </Tooltip>
          </Popconfirm>
        )}
        {isImage(fichier.typeMime) && (
          <TelechargementImagePreview
            telechargementId={fichier["@id"]}
            type={props.hideDownload ? "link" : undefined}
          />
        )}
        {!props.hideDownload && (
          <>
            {props.onEdit && (
              <Button
                aria-label={`Modifier la pièce justificative ${fichier.nom}`}
                onClick={() => {
                  props.onEdit?.();
                }}
                icon={<EditOutlined />}
              >
                Éditer
              </Button>
            )}
            <Button
              disabled={false}
              loading={downloading}
              icon={<DownloadOutlined aria-hidden />}
              aria-label={`Télécharger la pièce justificative ${fichier.nom}`}
              onClick={() => {
                downloadFile();
              }}
            >
              {props.onlyIcon ? "" : "Télécharger"}
            </Button>
          </>
        )}
      </Space.Compact>
    </Flex>
  );
}
