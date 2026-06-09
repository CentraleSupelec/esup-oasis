/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { RcFile } from "antd/es/upload";
import { ITelechargement } from "@api";
import { AuthContextType } from "@/auth/AuthProvider";
import { env } from "@/env";
import { logger } from "@utils/logger";

export function envoyerFichierFetch(
  apiUrl: string,
  auth: AuthContextType,
  file: string | Blob | RcFile,
  onSuccess: (pj: ITelechargement) => void,
  onError?: (err: Error) => void,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const fmData = new FormData();
  fmData.append("file", file);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onSuccess(JSON.parse(xhr.responseText));
        } catch (err) {
          logger.error("Parse error:", err);
          onError?.(new Error("Upload error"));
        }
      } else {
        logger.error("Error:", xhr.status);
        onError?.(new Error("Upload error"));
      }
      resolve();
    };

    xhr.onerror = () => {
      logger.error("Network error");
      onError?.(new Error("Upload error"));
      resolve();
    };

    xhr.open("POST", `${apiUrl}${env.REACT_APP_API_PREFIX}/telechargements`);
    xhr.withCredentials = true;

    if (auth.impersonate) {
      xhr.setRequestHeader("X-Switch-User", auth.impersonate);
    }

    xhr.send(fmData);
  });
}
