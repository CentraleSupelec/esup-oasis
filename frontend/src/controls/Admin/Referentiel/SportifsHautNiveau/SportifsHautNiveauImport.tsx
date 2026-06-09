/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Alert, App, Button, Card, Checkbox, Drawer, Form } from "antd";
import React, { ReactElement } from "react";
import { FichierDepot } from "@controls/Fichier/FichierDepot";
import { useApi } from "@context/api/ApiProvider";
import { QK_SPORTIFS_HAUT_NIVEAU } from "@api";

/**
 * Handles the creation or update of a clubSportife.
 *
 * @returns {ReactElement} - The rendered component.
 */
export function SportifsHautNiveauImport(props: {
  setOpen: (open: boolean) => void;
}): ReactElement {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [telechargementId, setTelechargementId] = React.useState<string>();
  const [processing, setProcessing] = React.useState<boolean>(false);

  const mutationImport = useApi().usePut({
    path: "/sportifs_haut_niveau",
    invalidationQueryKeys: [QK_SPORTIFS_HAUT_NIVEAU],
    onSuccess: () => {
      setProcessing(false);
      message.success("Importation réussie").then();
      props.setOpen(false);
    },
    onError: () => {
      message.error("Erreur lors de l'importation").then();
      setProcessing(false);
    },
  });

  return (
    <Drawer
      className="bg-light-grey"
      open
      title="Déposer un fichier de sportifs haut niveau"
      onClose={() => props.setOpen(false)}
      size="large"
    >
      <Card
        loading={processing}
        title="Sportif haut niveau"
        actions={[
          <Button onClick={() => props.setOpen(false)}>Annuler</Button>,
          <Button type="primary" onClick={form.submit}>
            Importer
          </Button>,
        ]}
      >
        <Form
          className="w-100"
          form={form}
          layout="vertical"
          onFinish={() => {
            if (!telechargementId) {
              message.error("Vous devez déposer un fichier").then();
            }

            setProcessing(true);
            mutationImport.mutate({
              "@id": "/sportifs_haut_niveau",
              data: {
                telechargement: telechargementId as string,
              },
            });
          }}
        >
          <Alert
            type="warning"
            title={<b className="semi-bold text-amber-dark">ATTENTION !</b>}
            description={
              <>
                En important un nouveau fichier, vous allez SUPPRIMER l'ensemble des identifiants
                sportifs haut niveau existant.{" "}
                <b className="semi-bold text-amber-dark">
                  Votre fichier doit donc contenir TOUS LES SPORTIFS de haut niveau.
                </b>
                <br />
                <br />
                Votre fichier doit être au format CSV (séparateur point-virgule). Il n'y a pas
                d'entête et les données attendues sont dans l'ordre suivant :
                <br />
                <pre>Numéro PSQS;Année de naissance</pre>
              </>
            }
            showIcon
          />

          <Form.Item name="fichier" label="Fichier à importer" className="mt-2" required>
            <FichierDepot
              onAdded={(fichier) => {
                setTelechargementId(fichier["@id"]);
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            required
            valuePropName="checked"
            className="mt-2"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject("Vous devez confirmer pour importer le fichier");
                  }
                },
              },
            ]}
          >
            <Checkbox>
              J'ai bien noté que l'importation de ce nouveau fichier supprimera les identifiants
              sportifs haut niveau (PSQS) actullement présents.
            </Checkbox>
          </Form.Item>
        </Form>
      </Card>
    </Drawer>
  );
}
