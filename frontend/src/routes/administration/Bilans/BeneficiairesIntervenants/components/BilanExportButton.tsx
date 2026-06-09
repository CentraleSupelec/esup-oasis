/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { CSVLink } from "react-csv";
import { env } from "@/env";

export interface IActiviteExport {
  nom?: string;
  prenom?: string;
  email?: string;
  campus?: string;
  "categorie evenement"?: string;
  nbEvenements?: number;
  nbHeures: string;
  "taux horaire": string;
  montant: string;
  "cout charge": string;
}

interface BilanExportButtonProps {
  type: "bénéficiaire" | "intervenant";
  data?: IActiviteExport[];
  totalItems?: number;
}

export const BilanExportButton: React.FC<BilanExportButtonProps> = ({ type, data, totalItems }) => {
  if (!data || totalItems === undefined || totalItems === 0) {
    return null;
  }

  return (
    <>
      <CSVLink data={data} filename={`${env.REACT_APP_TITRE}-bilan-${type}s.csv`} separator=";">
        <Button
          type={data ? "primary" : undefined}
          icon={<DownloadOutlined />}
          loading={!data}
          disabled={!data}
        >
          Télécharger le bilan
        </Button>
      </CSVLink>
      <div className="legende">
        ({totalItems} enregistrement
        {totalItems > 1 ? "s" : ""})
      </div>
    </>
  );
};
