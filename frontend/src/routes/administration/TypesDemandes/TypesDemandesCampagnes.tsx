import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { Card, Empty } from "antd";
import React from "react";
import { Campagne } from "@controls/Admin/TypesDemandes/Campagne";

export default function TypesDemandesCampagnes(props: { typeDemandeId: string }) {
  const { data: typesDemandesCampagnes, isFetching } = useApi().useGetFullCollection({
    path: "/types_demandes/{typeId}/campagnes",
    query: {
      "order[debut]": "desc",
    },
    parameters: {
      typeId: props.typeDemandeId,
    },
  });

  if (isFetching) return <Spinner />;
  if (typesDemandesCampagnes?.items.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune campagne trouvée" />;
  }

  return (
    <div>
      {typesDemandesCampagnes?.items.map((tdc) => {
        return (
          <Card title={tdc.libelle} className="mb-3">
            <Campagne
              title={tdc.libelle as string}
              typeDemandeId={props.typeDemandeId as string}
              campagneId={tdc["@id"]}
              showError
              showHeader={false}
              readOnly
            />
          </Card>
        );
      })}
    </div>
  );
}
