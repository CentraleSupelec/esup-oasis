import React from "react";
import AlertCompleterProfil from "@controls/Dashboard/AlertCompleterProfil";
import PlanningWithSider from "@controls/Calendar/PlanningWithSider";

export const BeneficiaireDashboard = () => {
  return (
    <>
      <div className="p-2">
        <AlertCompleterProfil />
      </div>
      <PlanningWithSider />
    </>
  );
};

export default BeneficiaireDashboard;
