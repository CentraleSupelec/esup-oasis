/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { DomaineAmenagementInfos, getTypesAmenagementByCategories } from "@lib";
import React, { useMemo } from "react";
import {
  ICategorieAmenagement,
  ITypeAmenagement,
  PREFETCH_CATEGORIES_AMENAGEMENTS,
  PREFETCH_TYPES_AMENAGEMENTS,
} from "@api";
import { useApi } from "@context/api/ApiProvider";
import { ModalAmenagement } from "@controls/Modals/ModalAmenagement";
import { ModalCategorieAddAmenagement } from "@controls/Modals/ModalCategorieAddAmenagement";
import { Button, Dropdown } from "antd";
import { AppstoreAddOutlined, AppstoreFilled, PlusOutlined } from "@ant-design/icons";

export function ButtonAddAmenagement(props: {
  utilisateurId: string;
  domaineAmenagement: DomaineAmenagementInfos;
}) {
  const [categorieAmenagementAjoute, setCategorieAmenagementAjoute] =
    React.useState<ICategorieAmenagement>();
  const [typeAmenagementAjoute, setTypeAmenagementAjoute] = React.useState<ITypeAmenagement>();

  const { data: typesAmenagements } = useApi().useGetFullCollection(PREFETCH_TYPES_AMENAGEMENTS);
  const { data: categoriesAmenagements } = useApi().useGetFullCollection(
    PREFETCH_CATEGORIES_AMENAGEMENTS,
  );

  const amenagementsByCategories = useMemo(() => {
    return getTypesAmenagementByCategories(
      categoriesAmenagements?.items || [],
      typesAmenagements?.items || [],
      props.domaineAmenagement.id,
    );
  }, [props, typesAmenagements, categoriesAmenagements]);

  return (
    <>
      {typeAmenagementAjoute && (
        <ModalAmenagement
          open={!!typeAmenagementAjoute}
          setOpen={(open) => {
            if (!open) {
              setTypeAmenagementAjoute(undefined);
            }
          }}
          typeAmenagementAjoute={typeAmenagementAjoute}
          utilisateurId={props.utilisateurId}
          domaineAmenagement={props.domaineAmenagement}
        />
      )}
      {categorieAmenagementAjoute && (
        <ModalCategorieAddAmenagement
          open={!!categorieAmenagementAjoute}
          setOpen={(open) => {
            if (!open) {
              setCategorieAmenagementAjoute(undefined);
            }
          }}
          categorieAmenagementAjoute={categorieAmenagementAjoute}
          utilisateurId={props.utilisateurId}
        />
      )}
      <Dropdown
        menu={{
          items: amenagementsByCategories?.map((c) => ({
            key: c["@id"] as string,
            label: c.libelle,
            children: [
              ...c.typesAmenagements.map((ta) => ({
                key: ta["@id"] as string,
                label: ta.libelle,
                icon: <AppstoreAddOutlined />,
                onClick: () => {
                  setTypeAmenagementAjoute(ta);
                },
              })),
              c.typesAmenagements.length > 1
                ? {
                    type: "divider",
                    key: "divider",
                  }
                : null,
              c.typesAmenagements.length > 1
                ? {
                    key: `${c["@id"]}_add-category`,
                    label: "Ajouter plusieurs aménagements",
                    icon: <AppstoreFilled />,
                    onClick: () => {
                      setCategorieAmenagementAjoute(c);
                    },
                  }
                : null,
            ],
          })),
        }}
      >
        <Button type="primary" icon={<PlusOutlined />}>
          Ajouter un aménagement
        </Button>
      </Dropdown>
    </>
  );
}
