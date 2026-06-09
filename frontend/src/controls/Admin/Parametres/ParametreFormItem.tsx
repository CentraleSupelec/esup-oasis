/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { App, Card } from "antd";
import { createDateAsUTC } from "@utils/dates";
import { IParametre, IParametreValeur, QK_PARAMETRES } from "@api";
import { ParametreFormItemFichier } from "@controls/Admin/Parametres/items/ParametreFormItemFichier";
import { ParametreFormItemString } from "@controls/Admin/Parametres/items/ParametreFormItemString";

interface ParametreFormItemProps {
  value?: string;
  onCancel?: () => void;
  parametre?: IParametre;
}

/**
 * Component to render a form item for parameter values.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.value] - The URL of the parameter value item.
 * @param {Function} [props.onCancel] - The cancel function to be called when editing is canceled.
 * @param {Object} [props.parametre] - The parameter object.
 *
 * @return {ReactElement} - The rendered form item component.
 */
export default function ParametreFormItem({
  value,
  onCancel,
  parametre,
}: ParametreFormItemProps): ReactElement {
  const { message } = App.useApp();
  const [editingItem, setEditingItem] = useState<IParametreValeur | undefined>(
    value
      ? undefined
      : ({
          debut: "",
          fin: undefined,
          valeur: "",
        } as IParametreValeur),
  );
  const { data: valeur, isFetching: isFetchingValeur } = useApi().useGetItem({
    path: "/parametres/{cle}/valeurs/{id}",
    url: value as string,
    enabled: !!value,
  });

  // Mutation d'une valeur
  const patchValeur = useApi().usePatch({
    path: "/parametres/{cle}/valeurs/{id}",
    invalidationQueryKeys: [QK_PARAMETRES],
    onSuccess: () => {
      message.success("Valeur du paramètre modifiée");
      setEditingItem(undefined);
    },
  });

  const postValeur = useApi().usePost({
    path: "/parametres/{cle}/valeurs",
    invalidationQueryKeys: [QK_PARAMETRES],
    parameters: {
      cle: `/parametres/${parametre?.["@id"]?.split("/")[2]}`,
    },
    onSuccess: () => {
      message.success("Valeur du paramètre sauvegardée").then();
      setEditingItem(undefined);
    },
  });

  function createOrUpdate() {
    if (!editingItem) return;
    if (!editingItem.debut) {
      message.error("Veuillez renseigner une date de début");
      return;
    }
    if (!parametre?.fichier && !editingItem.valeur) {
      message.error("Veuillez renseigner une valeur");
      return;
    }
    if (parametre?.fichier && !editingItem.fichier) {
      message.error("Veuillez déposer un fichier");
      return;
    }

    const data = {
      ...editingItem,
      debut: createDateAsUTC(new Date(editingItem.debut as string)).toISOString(),
      fin: editingItem.fin
        ? createDateAsUTC(new Date(editingItem.fin as string)).toISOString()
        : null,
      valeur: parametre?.fichier ? undefined : editingItem.valeur,
      fichier: parametre?.fichier ? editingItem.fichier : undefined,
    };
    if (editingItem?.["@id"]) {
      patchValeur.mutate({
        "@id": editingItem["@id"] as string,
        data,
      });
    } else {
      postValeur.mutate({
        data,
      });
    }
  }

  if (isFetchingValeur) {
    return <Card className="mb-2" loading />;
  }

  if (parametre?.fichier) {
    return (
      <ParametreFormItemFichier
        valeur={valeur}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        onCancel={onCancel}
        onSubmit={createOrUpdate}
      />
    );
  }

  return (
    <ParametreFormItemString
      valeur={valeur}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      onCancel={onCancel}
      onSubmit={createOrUpdate}
    />
  );
}
