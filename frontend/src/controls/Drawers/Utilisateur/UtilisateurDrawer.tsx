/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useApi } from "../../../context/api/ApiProvider";
import { IDrawers } from "../../../redux/context/IDrawers";
import { useDispatch, useSelector } from "react-redux";
import { IStore } from "../../../redux/Store";
import { setDrawerUtilisateur } from "../../../redux/actions/Drawers";
import { Alert, App, Button, Drawer, Form, Space, Tabs } from "antd";
import Spinner from "../../Spinner/Spinner";
import { getRoleLabel, RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import { SaveOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../auth/AuthProvider";
import { TabPersonneInformations } from "../../TabsContent/TabPersonneInformations";
import { TabDisponibilites } from "../../TabsContent/TabDisponibilites";
import { TabCompetences } from "../../TabsContent/TabCompetences";
import { TabCampuses } from "../../TabsContent/TabCampuses";
import { TabTypesEvenements } from "../../TabsContent/TabTypesEvenements";
import { TabScolarite } from "../../TabsContent/TabScolarite";
import { TabProfils } from "../../TabsContent/TabProfils";
import { queryClient } from "../../../App";
import { IUtilisateur } from "../../../api/ApiTypeHelpers";
import { TabAidesHumaines } from "../../TabsContent/TabAidesHumaines";
import UtilisateurAvatarImage from "../../Avatars/UtilisateurAvatarImage";
import { arrayUnique } from "../../../utils/array";

interface IUtilisateurDrawerProps {
   id?: string;
   onClose?: () => void;
}

const TabWithSaveButton = ["informations", "competences", "campus", "categories"];

/**
 * Draws the user details in a drawer, allow edition
 *
 * @param {IUtilisateurDrawerProps} props - The props object.
 * @param {string} [props.id] - The user id.
 * @param {Function} [props.onClose] - The function to handle the onClose event.
 *
 * @returns {ReactElement} - The user details drawer component.
 */
export default function UtilisateurDrawer({ id, onClose }: IUtilisateurDrawerProps): ReactElement {
   const [role, setRole] = useState<RoleValues>();
   const [utilisateurId, setUtilisateurId] = useState(id);
   const [utilisateur, setUtilisateur] = useState<Utilisateur>();
   const appDrawers: IDrawers = useSelector(({ drawers }: Partial<IStore>) => drawers) as IDrawers;
   const dispatch = useDispatch();
   const [form] = Form.useForm();
   const auth = useAuth();
   const [isBeneficiaireSansProfil, setIsBeneficiaireSansProfil] = useState(false);
   const [isIntervenantSansTypeEvenement, setIsIntervenantSansTypeEvenement] = useState(false);
   const [activeTab, setActiveTab] = useState("informations");
   const { message } = App.useApp();

   const getRole = useCallback((): RoleValues | string | undefined => {
      if (role) return role;
      if (utilisateur) return utilisateur.roleCalcule;
      return undefined;
   }, [role, utilisateur]);

   const handleClose = () => {
      setActiveTab("informations");
      if (onClose) onClose();
      if (!id) dispatch(setDrawerUtilisateur(undefined));
   };

   // ----- API
   // Récupération des données
   const { data, isFetching } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: utilisateurId as string,
      enabled: !!utilisateurId,
   });

   // Mutation de l'utilisateur
   const mutateUtilisateur = useApi().usePatch({
      path: "/utilisateurs/{uid}",
      invalidationQueryKeys: [
         "/utilisateurs",
         "/intervenants",
         "/beneficiaires",
         "/statistiques_evenements",
      ],
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["/composantes"] }).then();
         message.success("Utilisateur mis à jour").then();
         handleClose();
      },
   });

   // ----- FORM

   // Initialisation via Redux : UTILISATEUR
   useEffect(() => {
      if (!id) setUtilisateurId(appDrawers.UTILISATEUR);
   }, [id, appDrawers.UTILISATEUR]);

   // Initialisation via Redux : UTILISATEUR_ROLE
   useEffect(() => {
      if (!id) setRole(appDrawers.UTILISATEUR_ROLE);
   }, [id, appDrawers.UTILISATEUR_ROLE]);

   // Synchronisation des données data avec la variable utilisateur
   useEffect(() => {
      if (data) setUtilisateur(new Utilisateur(data));
   }, [form, data]);

   // Synchronisation de la variable utilisateur avec le formulaire
   useEffect(() => {
      form.resetFields();
      form.setFieldsValue(utilisateur);
   }, [form, utilisateur]);

   // --- Message alerte Bénéficiaire sans profil
   useEffect(() => {
      if (utilisateur && getRole() === RoleValues.ROLE_BENEFICIAIRE) {
         setIsBeneficiaireSansProfil(
            (auth.user?.isGestionnaire || false) &&
               (!utilisateur.profils || utilisateur.profils.length === 0),
         );
         setIsIntervenantSansTypeEvenement(false);
      }
   }, [auth.user, getRole, utilisateur]);

   // --- Message alerte Intervenant sans type evt
   useEffect(() => {
      if (utilisateur && getRole() === RoleValues.ROLE_INTERVENANT) {
         setIsIntervenantSansTypeEvenement(
            !utilisateur.typesEvenements || utilisateur.typesEvenements.length === 0,
         );
         setIsBeneficiaireSansProfil(false);
      }
   }, [getRole, utilisateur]);

   if (!data) return <Form form={form} />;
   if (isFetching || !utilisateur)
      return (
         <Form form={form}>
            <Spinner />
         </Form>
      );

   if (getRole() === "intervenant")
      return (
         <Form form={form}>
            <Alert title="Rôle de l'utilisateur inconnu" type="error" />
         </Form>
      );

   function getTabsByRole() {
      if (getRole() === RoleValues.ROLE_INTERVENANT) {
         return [
            {
               key: "campus",
               label: `Campus`,
               children: (
                  <TabCampuses
                     utilisateur={utilisateur as Utilisateur}
                     setUtilisateur={setUtilisateur}
                  />
               ),
            },
            {
               key: "categories",
               label: `Catégories`,
               children: (
                  <TabTypesEvenements
                     utilisateur={utilisateur as Utilisateur}
                     setUtilisateur={setUtilisateur}
                  />
               ),
            },
            {
               key: "competences",
               label: `Compétences`,
               children: (
                  <TabCompetences
                     utilisateur={utilisateur as Utilisateur}
                     setUtilisateur={setUtilisateur}
                     label="Compétences de l'intervenant"
                  />
               ),
            },
            {
               key: "disponibilites",
               label: `Validité`,
               children: (
                  <TabDisponibilites
                     utilisateur={utilisateur as IUtilisateur}
                     setUtilisateur={setUtilisateur}
                     onArchive={() => {
                        message.success("Utilisateur archivé").then();
                        handleClose();
                     }}
                  />
               ),
            },
         ];
      }

      if (getRole() === RoleValues.ROLE_BENEFICIAIRE) {
         const tabs = [];
         if (auth.user?.isGestionnaire) {
            tabs.push({
               key: "profil",
               label: "Profil",
               children: <TabProfils utilisateur={utilisateur as IUtilisateur} />,
            });
         }

         tabs.push({
            key: "scolarite",
            label: `Scolarité`,
            children: <TabScolarite utilisateur={data as IUtilisateur} />,
         });

         tabs.push({
            key: "aidesHumaines",
            label: `Aides humaines`,
            children: <TabAidesHumaines utilisateur={data as IUtilisateur} />,
         });

         return tabs;
      }

      return [];
   }

   return (
      <Drawer
         destroyOnHidden
         title={
            role ? getRoleLabel(getRole() as RoleValues).toLocaleUpperCase() : "PROFIL UTILISATEUR"
         }
         placement="right"
         onClose={handleClose}
         open
         size="large"
         className="oasis-drawer"
      >
         <Space orientation="vertical" className="text-center w-100 mb-3 mt-1">
            <UtilisateurAvatarImage
               utilisateurId={utilisateur["@id"] as string}
               height={220}
               as="img"
               fallback={<UserOutlined />}
               style={{ fontSize: 128 }}
               desactiverLazyLoading
            />
            <span className="fs-15 semi-bold">
               {`${utilisateur.prenom} ${utilisateur.nom?.toLocaleUpperCase()}`}
            </span>
         </Space>
         <Form<Utilisateur>
            layout="vertical"
            onFinish={(values) => {
               mutateUtilisateur.mutate({
                  "@id": utilisateur?.["@id"] as string,
                  data: {
                     ...{ ...values, nom: undefined, prenom: undefined, email: undefined },
                     roles: [...utilisateur?.roles, getRole() as RoleValues]
                        .filter((r) => r !== RoleValues.ROLE_DEMANDEUR && r !== "ROLE_USER")
                        .filter(arrayUnique),
                  },
               });
            }}
            disabled={!auth.user?.isPlanificateur}
            form={form}
         >
            <Tabs
               activeKey={activeTab}
               onChange={(key) => setActiveTab(key)}
               items={[
                  {
                     key: "informations",
                     label: `Informations`,
                     children: <TabPersonneInformations />,
                  },
                  ...getTabsByRole(),
               ]}
            />
            {TabWithSaveButton.some((t) => t === activeTab) && (
               <Form.Item className="mt-2 text-center">
                  {isBeneficiaireSansProfil && (
                     <Alert
                        title={
                           <>
                              Attention, un bénéficiaire doit au minimum avoir un <b>profil</b>.
                           </>
                        }
                        className="mb-2"
                        type="warning"
                     />
                  )}
                  {isIntervenantSansTypeEvenement && (
                     <Alert
                        title={
                           <>
                              Attention, un intervenant doit au minimum être lié à une{" "}
                              <b>catégorie</b> d'évènement.
                           </>
                        }
                        className="mb-2"
                        type="warning"
                     />
                  )}
                  <Button
                     type="primary"
                     icon={<SaveOutlined />}
                     htmlType="submit"
                     disabled={isBeneficiaireSansProfil || isIntervenantSansTypeEvenement}
                  >
                     Enregistrer
                  </Button>
               </Form.Item>
            )}
         </Form>
      </Drawer>
   );
}
