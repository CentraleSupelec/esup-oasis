/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "../../context/api/ApiProvider";
import { Card } from "antd";
import React from "react";
import { UtilisateurTag } from "./UtilisateurTag";
import { UtilisateurTagAjouter } from "./UtilisateurTagAjouter";

export function UtilisateurTags(props: { utilisateurId: string }) {
   const { data: tagsUtilisateur } = useApi().useGetCollection({
      path: "/utilisateurs/{uid}/tags",
      parameters: {
         uid: props.utilisateurId,
      },
   });

   return (
      <Card type="inner" size="small" variant={"borderless"} className="mb-2">
         {tagsUtilisateur?.items.map((tag) => (
            <UtilisateurTag
               key={tag["@id"] as string}
               tagId={tag.tag as string}
               utilisateurId={props.utilisateurId}
               utilisateurTagId={tag["@id"] as string}
               big
            />
         ))}
         <UtilisateurTagAjouter utilisateurId={props.utilisateurId} />
      </Card>
   );
}
