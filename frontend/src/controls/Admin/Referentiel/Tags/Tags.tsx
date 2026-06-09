/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { Button, Table } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import BooleanState from "@controls/State/BooleanState";
import React, { useState } from "react";
import { TagEdition } from "@controls/Admin/Referentiel/Tags/TagEdition";
import { ITag } from "@api";
import { UtilisateurTag } from "@controls/Tags/UtilisateurTag";

export function Tags(props: { categorieId: string; afficherDesactives: boolean }) {
  const [editedItem, setEditedItem] = useState<ITag | undefined>();
  const { data: tags } = useApi().useGetFullCollection({
    path: "/categories_tags/{id}/tags",
    parameters: {
      id: props.categorieId,
    },
  });

  if (!tags) return <Spinner />;

  return (
    <div key={props.categorieId}>
      <h3>Tags de la catégorie</h3>
      {editedItem && <TagEdition setEditedItem={setEditedItem} editedItem={editedItem} />}
      <Table
        className="mt-3 mb-3"
        pagination={false}
        dataSource={tags.items.filter((item) => props.afficherDesactives || item.actif)}
        rowKey={(record) => record["@id"] as string}
        caption={
          <div className="text-right bg-white">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                setEditedItem(
                  () =>
                    ({
                      libelle: "",
                      actif: true,
                      categorie: props.categorieId as string,
                    }) as ITag,
                )
              }
            >
              Ajouter un tag
            </Button>
          </div>
        }
        columns={[
          {
            title: "Tag",
            dataIndex: "libelle",
            key: "libelle",
            render: (_value, record) => <UtilisateurTag tagId={record["@id"] as string} />,
          },
          {
            title: "État",
            dataIndex: "actif",
            key: "actif",
            width: 100,
            render: (actif) => <BooleanState value={actif} onLabel="Activé" offLabel="Désactivé" />,
          },
          {
            dataIndex: "commandes",
            key: "commandes",
            className: "text-right commandes",
            width: 200,
            render: (_item, record) => (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditedItem(record);
                }}
              >
                Éditer
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
