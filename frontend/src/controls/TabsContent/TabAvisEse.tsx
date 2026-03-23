/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "../../context/api/ApiProvider";
import { NB_MAX_ITEMS_PER_PAGE } from "../../constants";
import { Button, Flex, Typography } from "antd";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import { IAvisEse } from "../../api/ApiTypeHelpers";
import { ModalAvisEse } from "../Modals/ModalAvisEse";
import { AvisEseList } from "../List/AvisEseList";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { env } from "../../env";

export function TabAvisEse(props: { utilisateurId: string }) {
   const screens = useBreakpoint();
   const [editedItem, setEditedItem] = React.useState<IAvisEse>();
   const { data: avis } = useApi().useGetCollectionPaginated({
      path: "/utilisateurs/{uid}/avis_ese",
      parameters: {
         uid: props.utilisateurId,
      },
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      query: {
         "order[debut]": "desc",
      },
   });

   return (
      <>
         <Flex justify="space-between" align="center" className="mt-1 mb-2" wrap>
            <Typography.Title level={3} className="mt-0 mb-0">
               Avis {process.env.REACT_APP_ESPACE_SANTE || "santé"}
            </Typography.Title>

            <div className={`text-right ${!screens.lg ? "mt-2" : ""}`}>
               {editedItem && (
                  <ModalAvisEse
                     open
                     setOpen={(open) => {
                        if (!open) setEditedItem(undefined);
                     }}
                     avisId={editedItem?.["@id"]}
                     utilisateurId={props.utilisateurId}
                     setEditedItem={setEditedItem}
                  />
               )}
               <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditedItem({})}>
                  Ajouter un avis {env.REACT_APP_ESPACE_SANTE_ABV || "santé"}
               </Button>
            </div>
         </Flex>

         <AvisEseList
            utilisateurId={props.utilisateurId}
            avis={avis?.items || []}
            setEditedItem={setEditedItem}
         />
      </>
   );
}
