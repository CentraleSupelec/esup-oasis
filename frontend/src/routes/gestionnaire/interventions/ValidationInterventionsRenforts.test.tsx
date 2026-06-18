import React from "react";
import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test";
import ValidationInterventionsRenforts from "./ValidationInterventionsRenforts";

vi.mock("@controls/Table/ValidationInterventionTable", () => ({
  default: () => <div data-testid="validation-intervention-table" />,
}));

vi.mock("@controls/Calendar/TimezoneAlert", () => ({
  TimezoneAlert: () => <div data-testid="timezone-alert" />,
}));

describe("ValidationInterventionsRenforts (route gestionnaire)", () => {
  it("affiche le titre de niveau 1 mentionnant 'Renforts service'", () => {
    renderWithProviders(<ValidationInterventionsRenforts />);
    expect(
      screen.getByRole("heading", { level: 1, name: /renforts service/i }),
    ).toBeInTheDocument();
  });

  it("affiche le sous-titre 'Interventions à valider'", () => {
    renderWithProviders(<ValidationInterventionsRenforts />);
    expect(
      screen.getByRole("heading", { level: 2, name: /interventions à valider/i }),
    ).toBeInTheDocument();
  });

  it("monte ValidationInterventionTable", () => {
    renderWithProviders(<ValidationInterventionsRenforts />);
    expect(screen.getByTestId("validation-intervention-table")).toBeInTheDocument();
  });

  it("monte TimezoneAlert", () => {
    renderWithProviders(<ValidationInterventionsRenforts />);
    expect(screen.getByTestId("timezone-alert")).toBeInTheDocument();
  });
});
