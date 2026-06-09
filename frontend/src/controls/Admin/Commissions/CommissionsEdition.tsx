/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Drawer } from "antd";
import { ICommission } from "@api";
import { CommissionsForm } from "@controls/Admin/Commissions/CommissionsForm";
import { CommissionsMembersList } from "@controls/Admin/Commissions/CommissionsMembersList";

interface CommissionsEditionProps {
  editedItem?: ICommission;
  setEditedItem: (item: ICommission | undefined) => void;
}

/**
 * Handles the creation or update of a profile.
 *
 * @param {CommissionsEditionProps} props - The component props.
 * @returns {ReactElement} - The rendered component.
 */
export function CommissionsEdition({
  editedItem,
  setEditedItem,
}: CommissionsEditionProps): ReactElement {
  return (
    <Drawer
      className="bg-light-grey"
      open
      title={editedItem?.["@id"] ? "Éditer une commission" : "Ajouter une commission"}
      onClose={() => setEditedItem(undefined)}
      size="large"
    >
      <CommissionsForm
        editedItem={editedItem}
        onSuccess={() => setEditedItem(undefined)}
        onCancel={() => setEditedItem(undefined)}
      />
    </Drawer>
  );
}

/**
 * List of members of a commission.
 * Exported because used in CommissionsTable as an expandable row.
 */
export const CommissionsEditionMembres = CommissionsMembersList;
