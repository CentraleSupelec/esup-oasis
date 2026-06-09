/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Flex, Input, Modal, Popconfirm } from "antd";
import {
  initialAffichageFiltres,
  useAffichageFiltres,
} from "@context/affichageFiltres/AffichageFiltresContext";
import { DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_TYPES_EVENEMENTS } from "@api";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";

export function FiltresFavorisEvenements() {
  const { message } = App.useApp();
  const { getPreferenceArray, setPreferenceArray } = usePreferences();
  const { data: typesEvenements } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);
  const {
    affichageFiltres: appAffichageFiltres,
    restoreFiltres,
    setFiltres,
  } = useAffichageFiltres();
  const [modalOpen, setModalOpen] = useState(false);
  const [nomFiltre, setNomFiltre] = useState("Nouveau filtre");

  function sauvegarderFiltre() {
    const hasSameName = getPreferenceArray("filtresEvenement").some((f) => f.nom === nomFiltre);
    if (hasSameName) {
      message.error("Un filtre enregistré porte déjà ce nom");
      return;
    }
    setPreferenceArray("filtresEvenement", [
      ...(getPreferenceArray("filtresEvenement") || []),
      { filtre: { ...appAffichageFiltres.filtres }, nom: nomFiltre, favori: false },
    ]);
    message.success("Filtre enregistré");
    setModalOpen(false);
    setNomFiltre("Nouveau filtre");
  }

  return (
    <li className="filter mb-1 mt-2">
      <h2 className="sr-only">Filtres</h2>
      <Dropdown
        menu={{
          items: [
            ...getPreferenceArray("filtresEvenement").map((filtre) => ({
              key: filtre.nom,
              label: (
                <Flex justify="space-between">
                  <span>{filtre.nom}</span>
                  <Popconfirm
                    title="Supprimer le filtre ?"
                    onConfirm={(event) => {
                      event?.stopPropagation();
                      setPreferenceArray(
                        "filtresEvenement",
                        getPreferenceArray("filtresEvenement").filter((f) => f.nom !== filtre.nom),
                      );
                    }}
                  >
                    <Button
                      size="small"
                      type="link"
                      className="text-light"
                      icon={<DeleteOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  </Popconfirm>
                </Flex>
              ),
              onClick: () => {
                restoreFiltres({
                  ...filtre.filtre,
                  debut: appAffichageFiltres.filtres.debut,
                  fin: appAffichageFiltres.filtres.fin,
                  page: 1,
                });
              },
            })),
            getPreferenceArray("filtresEvenement").length > 0
              ? {
                  type: "divider",
                  key: "divider",
                }
              : null,
            {
              key: "save",
              label: "Enregistrer comme nouveau filtre",
              onClick: () => setModalOpen(true),
            },
            {
              key: "reset",
              label: "Retirer les filtres",
              onClick: () =>
                setFiltres(
                  {
                    ...initialAffichageFiltres.filtres,
                    debut: appAffichageFiltres.filtres.debut,
                    fin: appAffichageFiltres.filtres.fin,
                    type: typesEvenements?.items
                      .filter((t) => t.visibleParDefaut)
                      .filter((t) => t.actif)
                      .map((t) => t["@id"] as string),
                  },
                  true,
                ),
            },
          ],
        }}
      >
        <Button icon={<FilterOutlined />} type="dashed" className="mb-0 w-100">
          Filtres enregistrés
        </Button>
      </Dropdown>
      <Modal
        title="Enregistrer le filtre"
        open={modalOpen}
        onOk={sauvegarderFiltre}
        onCancel={() => {
          setModalOpen(false);
          setNomFiltre("Nouveau filtre");
        }}
        okText="Enregistrer"
        cancelText="Annuler"
      >
        <Input
          value={nomFiltre}
          onChange={(e) => setNomFiltre(e.target.value)}
          placeholder="Nom du filtre"
          onPressEnter={sauvegarderFiltre}
          autoFocus
        />
      </Modal>
    </li>
  );
}
