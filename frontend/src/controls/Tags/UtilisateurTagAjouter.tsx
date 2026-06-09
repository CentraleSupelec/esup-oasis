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
import { App, Button, Dropdown } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React from "react";

export function UtilisateurTagAjouter(props: { utilisateurId: string }) {
  const { message } = App.useApp();
  const { data: categories } = useApi().useGetFullCollection(PREFETCH_CATEGORIES_TAGS);
  const { data: tags } = useApi().useGetFullCollection(PREFETCH_TAGS);

  const mutatePost = useApi().usePost({
    path: "/utilisateurs/{uid}/tags",
    url: `${props.utilisateurId}/tags`,
    onSuccess: () => {
      message.success("Tag ajouté").then();
    },
    invalidationQueryKeys: [QK_UTILISATEURS_TAGS, QK_BENEFICIAIRES, props.utilisateurId as string],
  });

  return (
    categories &&
    tags && (
      <Dropdown
        menu={{
          items: (categories?.items || [])
            .filter((c) => c.actif)
            .map((c) => ({
              label: c.libelle,
              key: c["@id"] as string,
              children: (tags?.items || [])
                .filter((t) => t.actif && t.categorie === c["@id"])
                .map((t) => ({
                  label: t.libelle,
                  key: t["@id"] as string,
                  onClick: () =>
                    mutatePost.mutate({
                      data: { tag: t["@id"] as string },
                    }),
                })),
            })),
        }}
      >
        <Button type="dashed" className="mt-05 mb-05" icon={<PlusOutlined />}>
          Ajouter un tag
        </Button>
      </Dropdown>
    )
  );
}
