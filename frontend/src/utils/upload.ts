/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import {RcFile} from "antd/es/upload";
import {ITelechargement} from "../api/ApiTypeHelpers";
import {AuthContextType} from "../auth/AuthProvider";
import {env} from "../env";

export async function envoyerFichierXhr(
    apiUrl: string,
    auth: AuthContextType,
    file: string | Blob | RcFile,
    onSuccess: (pj: ITelechargement) => void,
    onError?: (err: Error) => void,
    onProgress?: (percent: number) => void,
) {
    const fmData = new FormData();
    fmData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";

    // progress
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            onProgress?.(percent);
        }
    };

    // end
    xhr.onload = () => {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201)) {
            onSuccess(xhr.response);
        } else {
            console.error("Error:", xhr);
            onError?.(new Error("Upload error"));
        }
    };

    // error
    xhr.onerror = () => {
        console.error("Error:", xhr);
        onError?.(new Error("Upload error"));
    };

    // send
    xhr.open("POST", `${apiUrl}${env.REACT_APP_API_PREFIX}/telechargements`, true);
    //xhr.setRequestHeader("Authorization", `Bearer ${auth.token}`);
    if (auth.impersonate) {
        xhr.setRequestHeader("X-Switch-User", auth.impersonate);
    }

    xhr.withCredentials = true;
    xhr.send(fmData);
}

export async function envoyerFichierFetch(
    apiUrl: string,
    auth: AuthContextType,
    file: string | Blob | RcFile,
    onSuccess: (pj: ITelechargement) => void,
    onError?: (err: Error) => void,
) {
    const fmData = new FormData();
    fmData.append("file", file);

    const fetchOptions: RequestInit = {
        method: "POST",
        body: fmData,
        credentials: "include",
    };

    if (auth.impersonate) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            "X-Switch-User": auth.impersonate,
        };
    }

    try {
        const response = await fetch(`${apiUrl}${env.REACT_APP_API_PREFIX}/telechargements`, fetchOptions);
        if (response.ok) {
            const json = await response.json();
            onSuccess(json);
        } else {
            console.error("Error:", response);
            onError?.(new Error("Upload error"));
        }
    } catch (err) {
        console.error("Error:", err);
        onError?.(new Error("Upload error"));
    }
}
