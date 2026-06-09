/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { Avatar, Drawer, Form, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import IntervenantRechercherFilters, {
  IFiltreRechercheIntervenant,
} from "@controls/Drawers/Intervenant/IntervenantRechercherFilters";
import IntervenantRechercherResults from "@controls/Drawers/Intervenant/IntervenantRechercherResults";

export type { IFiltreRechercheIntervenant };

interface IIntervenantDrawer {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChange: (id: string) => void;
  defaultSearchOptions?: IFiltreRechercheIntervenant;
  afficherFiltres: boolean;
  btnLabel?: string;
}

/**
 * Drawer component for searching and selecting an Intervenant
 *
 * @param {object} props - The properties object
 * @param {function} props.onChange - Callback function when an Intervenant is selected
 * @param {boolean} props.open - Flag to control the visibility of the Drawer
 * @param {function} props.setOpen - Callback function to control the visibility of the Drawer
 * @param {object} [props.defaultSearchOptions] - Default search options for the Intervenant search
 * @param {boolean} props.afficherFiltres - Flag to display filter options in the Drawer
 * @param {string} [props.btnLabel] - Label for the "Affecter" button in the Drawer
 *
 * @returns {ReactElement} The IntervenantRechercherDrawer component
 */
export default function IntervenantRechercherDrawer({
  onChange,
  open,
  setOpen,
  defaultSearchOptions,
  afficherFiltres,
  btnLabel = "Affecter",
}: IIntervenantDrawer) {
  const [form] = Form.useForm();
  const [filtreRecherche, setFiltreRecherche] = useState<IFiltreRechercheIntervenant>(
    defaultSearchOptions || {},
  );
  const [selectedIntervenant, setSelectedIntervenant] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const { data: intervenantsProposes, isFetching } = useApi().useGetFullCollection({
    path: "/intervenants",
    enabled: submitted,
    query: filtreRecherche,
  });

  useEffect(() => {
    if (defaultSearchOptions && !submitted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltreRecherche(defaultSearchOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearchOptions]);

  const handleClose = () => {
    setSubmitted(false);
    setFiltreRecherche({});
    setOpen(false);
    setSelectedIntervenant(undefined);
    form.resetFields();
  };

  const handleAffecter = () => {
    if (selectedIntervenant) onChange(selectedIntervenant);
    handleClose();
  };

  return (
    <Drawer
      destroyOnHidden
      title={"Intervenant".toLocaleUpperCase()}
      placement="right"
      onClose={handleClose}
      open={open}
      size="large"
      className="oasis-drawer"
    >
      <Space orientation="vertical" className="text-center w-100 mb-3 mt-1">
        <Avatar size={100} icon={<SearchOutlined />} className="bg-intervenant shadow-1" />
      </Space>
      {!intervenantsProposes && (
        <IntervenantRechercherFilters
          form={form}
          filtreRecherche={filtreRecherche}
          setFiltreRecherche={setFiltreRecherche}
          onSearch={() => setSubmitted(true)}
          loading={isFetching}
          afficherFiltres={afficherFiltres}
        />
      )}
      {intervenantsProposes && submitted && (
        <IntervenantRechercherResults
          intervenantsProposes={intervenantsProposes}
          selectedIntervenant={selectedIntervenant}
          setSelectedIntervenant={setSelectedIntervenant}
          onBack={() => setSubmitted(false)}
          onAffecter={handleAffecter}
          btnLabel={btnLabel}
        />
      )}
    </Drawer>
  );
}
