/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Avatar, Card, Empty, List, Tooltip } from "antd";
import React, { ReactElement } from "react";
import { IInscription, IUtilisateur } from "../../api/ApiTypeHelpers";
import { getLibellePeriode, isEnCoursSurPeriode } from "../../utils/dates";
import ComposanteItem from "../Items/ComposanteItem";
import { env } from "../../env";
import { CheckOutlined, PlusOutlined } from "@ant-design/icons";

interface ITabScolariteProps {
   utilisateur: IUtilisateur;
}

interface ITabScolariteItemProps {
   inscription: IInscription;
   titleClassName?: string;
}

/**
 * Renders a single item in the TabScolarite component.
 *
 * @param {ITabScolariteItemProps} props - The props object.
 * @param {IInscription} props.inscription - The inscription object containing information about the item.
 *
 * @return {ReactElement} - The rendered item component.
 */
export function ScolariteListItem({
   inscription,
   titleClassName = "text-primary",
}: ITabScolariteItemProps): ReactElement {
   return (
      <Card className="mb-1 mt-1">
         <Card.Meta
            avatar={
               isEnCoursSurPeriode(inscription.debut, inscription.fin) ? (
                  <Tooltip title="En cours">
                     <Avatar
                        size="small"
                        className="bg-success"
                        icon={<CheckOutlined className="fs-08" aria-hidden />}
                     >
                        <CheckOutlined className="mt-1" />
                     </Avatar>
                  </Tooltip>
               ) : (
                  <Tooltip title="Terminé">
                     <Avatar
                        size="small"
                        icon={<PlusOutlined rotate={45} className="fs-08 text-text" aria-hidden />}
                     />
                  </Tooltip>
               )
            }
            title={
               <div style={{ whiteSpace: "wrap", lineHeight: 1.25 }} className={titleClassName}>
                  <div className="mb-1">{inscription.formation?.libelle}</div>
                  <ComposanteItem composanteId={inscription.formation?.composante} />
               </div>
            }
            description={getLibellePeriode(inscription.debut, inscription.fin, "MMM")}
         />
      </Card>
   );
}

/**
 * Renders the "TabScolarite" component.
 * This component displays the user's registrations.
 *
 * @param {ITabScolariteProps} props - The component props.
 * @param {IUtilisateur} props.utilisateur - The user object containing the registrations.
 *
 * @returns {ReactElement} The rendered component.
 */
export function TabScolarite({ utilisateur }: ITabScolariteProps): ReactElement {
   return (
      <>
         <p className="semi-bold">Inscriptions à {env.REACT_APP_ETABLISSEMENT_ABV_ARTICLE}</p>
         {utilisateur.inscriptions?.length === 0 ? (
            <Empty description="Aucune inscription" />
         ) : (
            <List className="ant-list-radius no-hover">
               {utilisateur.inscriptions?.map((inscription) => (
                  <ScolariteListItem
                     key={inscription?.formation?.codeExterne}
                     inscription={inscription}
                  />
               ))}
            </List>
         )}
      </>
   );
}
