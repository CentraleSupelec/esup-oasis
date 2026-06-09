/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { Button, Flex, Typography } from "antd";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import { IEntretien } from "@api";
import { EntretienList } from "@controls/List/EntretienList";
import { ModalEntretien } from "@controls/Modals/ModalEntretien";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export function TabEntretiens(props: { utilisateurId: string }) {
  const screens = useBreakpoint();
  const [editedItem, setEditedItem] = React.useState<IEntretien>();
  const { data: entretiens } = useApi().useGetFullCollection({
    path: "/utilisateurs/{uid}/entretiens",
    parameters: {
      uid: props.utilisateurId,
    },
    query: {
      "order[date]": "desc",
    },
  });

  return (
    <>
      <Flex justify="space-between" align="center" className="mt-1 mb-2" wrap>
        <Typography.Title level={3} className="mt-0 mb-0">
          Synthèses d'entretiens
        </Typography.Title>

        <div className={`text-right ${!screens.lg ? "mt-2" : ""}`}>
          {editedItem && (
            <ModalEntretien
              open
              setOpen={(open) => {
                if (!open) setEditedItem(undefined);
              }}
              entretienId={editedItem?.["@id"]}
              utilisateurId={props.utilisateurId}
              setEditedItem={setEditedItem}
            />
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditedItem({} as IEntretien)}
          >
            Ajouter un entretien
          </Button>
        </div>
      </Flex>

      <EntretienList
        utilisateurId={props.utilisateurId}
        entretiens={entretiens?.items || []}
        setEditedItem={setEditedItem}
      />
    </>
  );
}
