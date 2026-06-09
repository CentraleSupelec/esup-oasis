import React from "react";
import { useLocation } from "react-router-dom";
import BilanBeneficiaireIntervenant from "@routes/administration/Bilans/BeneficiairesIntervenants/BilanBeneficiaireIntervenant";

export const BilanBeneficiaireIntervenantComponent = () => {
  const location = useLocation();
  const type = location.pathname.includes("intervenants") ? "intervenant" : "bénéficiaire";
  return <BilanBeneficiaireIntervenant type={type} />;
};

export default BilanBeneficiaireIntervenantComponent;
