/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import type { MenuProps } from "antd";
import { App, Button, Dropdown, Popconfirm, Space } from "antd";
import { DeleteOutlined, DownOutlined, WarningOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { queryClient } from "@/queryClient";
import { IEvenement, QK_EVENEMENTS } from "@api";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

interface IEventDeleteButtonProps {
  evenement: IEvenement;
  onDelete?: () => void;
}

/**
 * Render a dropdown button to either cancel or delete an event.
 *
 * @param {Object} props - The component props.
 * @param {IEvenement} props.evenement - The event object.
 * @param {Function} props.onDelete - The function to call when event is deleted.
 * @returns {ReactElement} - The rendered dropdown button.
 */
export default function EventDeleteButton({
  evenement,
  onDelete,
}: IEventDeleteButtonProps): ReactElement {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>();
  // Event delete mutation
  const { mutate: deleteEvent, isPending: isDeleting } = useApi().useDelete({
    path: "/evenements/{id}",
    invalidationQueryKeys: [QK_EVENEMENTS],
    onSuccess: () => {
      message.success("évènement supprimé").then();
    },
  });

  // Event patch mutation
  const mutationPatch = useApi().usePatch({
    path: "/evenements/{id}",
    invalidationQueryKeys: [QK_EVENEMENTS],
    onSuccess: () => {
      onDelete?.();
    },
  });

  const onClick: MenuProps["onClick"] = ({ key }) => {
    setSelectedMenuKey(key);
  };

  return (
    <Space>
      <Dropdown
        menu={{
          items: [
            {
              key: "annuler",
              label: "Annuler",
            },
            {
              key: "supprimer",
              label: "Supprimer",
              danger: true,
            },
          ],
          onClick,
        }}
      >
        <Popconfirm
          okText={selectedMenuKey === "supprimer" ? "Supprimer l'évènement" : "Annuler l'évènement"}
          okButtonProps={{
            loading: isDeleting || mutationPatch.isPending,
            danger: selectedMenuKey === "supprimer",
            icon: <WarningOutlined />,
          }}
          cancelText="Non"
          title={
            selectedMenuKey === "supprimer"
              ? "Êtes-vous sûr de vouloir supprimer cet évènement ?"
              : "Êtes-vous sûr de vouloir annuler cet évènement ?"
          }
          description={
            selectedMenuKey === "supprimer" ? (
              <>
                Un évènement supprimé <b className="text-warning">NE SERA PAS</b> payé à
                l'intervenant.
              </>
            ) : (
              <>
                Un évènement annulé <b className="text-warning">SERA</b> payé à l'intervenant.
              </>
            )
          }
          open={selectedMenuKey !== undefined}
          onCancel={() => setSelectedMenuKey(undefined)}
          onConfirm={() => {
            if (selectedMenuKey === "supprimer") {
              const id = evenement["@id"] as string;
              queryClient.removeQueries({ queryKey: [id] });
              // On ferme la modale puis on supprime pour éviter que react-query ne rafraichisse l'entité
              // supprimée
              onDelete?.();
              deleteEvent({ "@id": id });
            } else if (selectedMenuKey === "annuler") {
              mutationPatch?.mutate({
                "@id": evenement["@id"] as string,
                data: {
                  ...evenement,
                  dateAnnulation: new Date().toISOString(),
                } as IEvenement,
              });
            }
          }}
        >
          <Button icon={<DeleteOutlined />} danger aria-label="Annuler ou supprimer l'évènement">
            <Space className="ml-1">
              {screens.lg ? "Supprimer" : null}
              <DownOutlined />
            </Space>
          </Button>
        </Popconfirm>
      </Dropdown>
    </Space>
  );
}
