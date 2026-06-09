/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Button, Empty, List, Tag, Typography } from "antd";
import React, { ReactElement, useState } from "react";
import { IAmenagement, IUtilisateur, PREFETCH_TYPES_AMENAGEMENTS } from "@api";
import { getLibellePeriode } from "@utils/dates";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { SuiviAmenagementItem } from "@controls/Items/SuiviAmenagementItem";
import { EditOutlined } from "@ant-design/icons";
import { ModalAmenagement } from "@controls/Modals/ModalAmenagement";

interface ITabAidesHumainesProps {
  utilisateur: IUtilisateur;
}

interface ITabAidesHumainesItemProps {
  aide: IAmenagement;
  titleClassName?: string;
  setEditedItem?: (id: string) => void;
}

/**
 * Renders a single item in the TabAidesHumaines component.
 *
 * @param {ITabAidesHumainesItemProps} props - The props object.
 * @param {IAmenagement} props.aide - The inscription object containing information about the item.
 *
 * @return {ReactElement} - The rendered item component.
 */
export function AideHumaineListItem({
  aide,
  titleClassName = "text-primary",
  setEditedItem,
}: ITabAidesHumainesItemProps): ReactElement {
  const { data: types } = useApi().useGetFullCollection(PREFETCH_TYPES_AMENAGEMENTS);

  return (
    <List.Item>
      <List.Item.Meta
        title={
          <span className={titleClassName}>
            <div className="mb-2">
              {aide.suivi && <SuiviAmenagementItem className="float-right" suiviId={aide.suivi} />}
              {types?.items.find((ta) => ta["@id"] === aide.typeAmenagement)?.libelle}
            </div>
          </span>
        }
        description={
          <>
            {(aide.debut || aide.fin) && <div>{getLibellePeriode(aide.debut, aide.fin)}</div>}
            {aide.semestre1 || aide.semestre2 ? (
              <div>
                {aide.semestre1 && <Tag>Semestre 1</Tag>}
                {aide.semestre2 && <Tag>Semestre 2</Tag>}
              </div>
            ) : null}
            {aide.commentaire && (
              <div>
                <Typography.Text type="secondary">{aide.commentaire}</Typography.Text>
              </div>
            )}
            <Button
              className="mt-2"
              icon={<EditOutlined />}
              onClick={() => setEditedItem?.(aide["@id"] as string)}
            >
              Éditer
            </Button>
          </>
        }
      />
    </List.Item>
  );
}

/**
 * Renders the "TabAidesHumaines" component.
 * This component displays the user's registrations.
 *
 * @param {ITabAidesHumainesProps} props - The component props.
 * @param {IUtilisateur} props.utilisateur - The user object containing the registrations.
 *
 * @returns {ReactElement} The rendered component.
 */
export function TabAidesHumaines({ utilisateur }: ITabAidesHumainesProps): ReactElement {
  const [editedItem, setEditedItem] = useState<string>();
  const { data: amenagements, isFetching } = useApi().useGetFullCollection({
    path: "/utilisateurs/{uid}/amenagements",
    parameters: { uid: utilisateur["@id"] as string },
    enabled: !!utilisateur["@id"],
  });

  if (isFetching) return <Spinner />;
  if (!amenagements || amenagements.totalItems === 0)
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun amenagement" />;

  return (
    <>
      <p className="semi-bold">Aides humaines</p>
      {utilisateur.inscriptions?.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun aménagement" />
      ) : (
        <>
          {editedItem !== undefined && (
            <ModalAmenagement
              amenagementId={editedItem}
              open={true}
              setOpen={(open) => {
                if (!open) setEditedItem(undefined);
              }}
            />
          )}
          <List className="ant-list-radius">
            {amenagements.items?.map((aide) => (
              <AideHumaineListItem key={aide["@id"]} aide={aide} setEditedItem={setEditedItem} />
            ))}
          </List>
        </>
      )}
    </>
  );
}
