/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { IDemande, ITypeDemande } from "../../../api/ApiTypeHelpers";
import { useApi } from "../../../context/api/ApiProvider";
import { useNavigate } from "react-router-dom";
import { NB_MAX_ITEMS_PER_PAGE } from "../../../constants";
import { useEffect, useState } from "react";

export default function PostulerButton(props: { typeDemande: ITypeDemande; demandeurId: string }) {
   const navigate = useNavigate();
   const [demandeTrouvee, setDemandeTrouvee] = useState<IDemande>();
   const [submitted, setSubmitted] = useState(false);
   const { data: demandesEnCours } = useApi().useGetCollectionPaginated({
      path: "/demandes",
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      query: {
         demandeur: props.demandeurId,
         format_simple: true,
      },
   });

   const mutationPostuler = useApi().usePost({
      path: "/demandes",
      invalidationQueryKeys: ["/utilisateurs/{uid}/demandes", "/demandes"],
      onSuccess: (data) => {
         navigate(`${data["@id"]}/saisie`);
      },
   });

   useEffect(() => {
      setDemandeTrouvee(
         demandesEnCours?.items.find(
            (demande) => demande.campagne === props.typeDemande.campagneEnCours,
         ),
      );
   }, [demandesEnCours, props.typeDemande.campagneEnCours]);

   function deposerNouvelleDemande(item: ITypeDemande) {
      mutationPostuler.mutate({
         data: {
            typeDemande: item["@id"] as string,
            demandeur: props.demandeurId,
         },
      });
   }

   return demandeTrouvee ? (
      <Button
         icon={<EyeOutlined aria-hidden />}
         onClick={() => navigate(demandeTrouvee?.["@id"] as string)}
      >
         Voir la demande
      </Button>
   ) : (
      props.typeDemande.campagneEnCours && (
         <Button
            loading={submitted}
            disabled={submitted}
            icon={<PlusOutlined aria-hidden />}
            onClick={() => {
               setSubmitted(true);
               deposerNouvelleDemande(props.typeDemande);
            }}
            aria-label={`Déposer une demande : ${props.typeDemande.libelle}`}
         >
            Déposer une demande
         </Button>
      )
   );
}
