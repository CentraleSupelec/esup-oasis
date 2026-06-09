/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import {
  PREFETCH_CATEGORIES_TAGS,
  PREFETCH_TAGS,
  QK_BENEFICIAIRES,
  QK_UTILISATEURS_TAGS,
} from "@api";
import { App, Tag, Tooltip } from "antd";
import { TagOutlined } from "@ant-design/icons";
import React from "react";

export function UtilisateurTag(props: {
  utilisateurTagId?: string;
  tagId: string;
  utilisateurId?: string;
  big?: boolean;
  className?: string;
}) {
  const { message } = App.useApp();
  const { data: categories } = useApi().useGetFullCollection(PREFETCH_CATEGORIES_TAGS);
  const { data: tags } = useApi().useGetFullCollection(PREFETCH_TAGS);

  const mutationDelete = useApi().useDelete({
    path: `/utilisateurs/{uid}/tags/{id}`,
    invalidationQueryKeys: [QK_UTILISATEURS_TAGS, QK_BENEFICIAIRES, props.utilisateurId as string],
    onSuccess: () => {
      message.success("Tag supprimé").then();
    },
  });

  const tag = tags?.items.find((t) => t["@id"] === props.tagId);
  const categorie = categories?.items.find((c) => c["@id"] === tag?.categorie);

  return (
    <Tooltip title={`${categorie?.libelle} > ${tag?.libelle}`}>
      <Tag
        key={props.tagId}
        icon={<TagOutlined />}
        className={`mt-05 mb-05 mr-05 tag-beneficiaire ${props.big ? "tag-beneficiaire-big" : ""} ${props.className}`}
        closable={!!props.utilisateurTagId}
        onClose={() => {
          if (!props.utilisateurTagId) return;
          mutationDelete.mutate({
            "@id": props.utilisateurTagId,
          });
        }}
      >
        {tag?.libelle}
      </Tag>
    </Tooltip>
  );
}
