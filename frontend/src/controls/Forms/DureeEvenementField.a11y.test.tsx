import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect } from "vitest";
import DureeEvenementField from "./DureeEvenementField";
import { IEvenement } from "@api";

function makeEvenement(debutISO: string, finISO: string): IEvenement {
  return { "@id": "/evenements/1", debut: debutISO, fin: finISO } as IEvenement;
}

describe("DureeEvenementField — accessibilité", () => {
  it("affiche la durée calculée (60 minutes)", () => {
    render(
      <DureeEvenementField
        evenement={makeEvenement("2024-01-01T10:00:00", "2024-01-01T11:00:00")}
      />,
    );
    expect(screen.getByDisplayValue("60")).toBeInTheDocument();
    expect(screen.getByText("minutes")).toBeInTheDocument();
  });

  it("affiche 'minute' au singulier pour 1 minute", () => {
    render(
      <DureeEvenementField
        evenement={makeEvenement("2024-01-01T10:00:00", "2024-01-01T10:01:00")}
      />,
    );
    expect(screen.getByText("minute")).toBeInTheDocument();
  });

  it("aucune violation axe-core", async () => {
    const { container } = render(
      <DureeEvenementField
        evenement={makeEvenement("2024-01-01T10:00:00", "2024-01-01T11:30:00")}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
