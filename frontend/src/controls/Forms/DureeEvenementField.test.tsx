/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DureeEvenementField from "./DureeEvenementField";
import { DureeTotaleEvenementField } from "./DureeTotalEvenementField";
import { IEvenement } from "@api";

function makeEv(debutISO: string, finISO: string, extra?: Partial<IEvenement>): IEvenement {
  return { "@id": "/evenements/1", debut: debutISO, fin: finISO, ...extra } as IEvenement;
}

// ---------------------------------------------------------------------------
// DureeEvenementField
// ---------------------------------------------------------------------------

describe("DureeEvenementField — calcul de durée", () => {
  it("affiche 0 minute quand debut = fin", () => {
    render(
      <DureeEvenementField evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T10:00:00")} />,
    );
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    // Singulier : 0 est ≤ 1, donc la logique `> 1` retombe sur "minute"
    expect(screen.getByText("minute")).toBeInTheDocument();
  });

  it("affiche 90 minutes pour une durée de 1h30", () => {
    render(
      <DureeEvenementField evenement={makeEv("2024-01-01T09:00:00", "2024-01-01T10:30:00")} />,
    );
    expect(screen.getByDisplayValue("90")).toBeInTheDocument();
    expect(screen.getByText("minutes")).toBeInTheDocument();
  });

  it("affiche 120 minutes pour une durée de 2h", () => {
    render(
      <DureeEvenementField evenement={makeEv("2024-01-01T08:00:00", "2024-01-01T10:00:00")} />,
    );
    expect(screen.getByDisplayValue("120")).toBeInTheDocument();
    expect(screen.getByText("minutes")).toBeInTheDocument();
  });

  it("l'input est bien désactivé (lecture seule)", () => {
    render(
      <DureeEvenementField evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00")} />,
    );
    const input = screen.getByRole("textbox", { name: /durée de l'événement en minutes/i });
    expect(input).toBeDisabled();
  });

  it("transmet l'aria-label correct à l'input", () => {
    render(
      <DureeEvenementField evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00")} />,
    );
    expect(
      screen.getByRole("textbox", { name: "Durée de l'événement en minutes" }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DureeTotaleEvenementField — calcul total (durée + préparation + supplémentaire)
// ---------------------------------------------------------------------------

describe("DureeTotaleEvenementField — calcul total", () => {
  it("durée seule sans temps additionnels", () => {
    render(
      <DureeTotaleEvenementField
        evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00")}
      />,
    );
    expect(screen.getByDisplayValue("60")).toBeInTheDocument();
    expect(screen.getByText("minutes")).toBeInTheDocument();
    expect(screen.getByText(/1\.0 heure\(s\)/)).toBeInTheDocument();
  });

  it("ajoute tempsPreparation à la durée", () => {
    render(
      <DureeTotaleEvenementField
        evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00", {
          tempsPreparation: 15,
        })}
      />,
    );
    expect(screen.getByDisplayValue("75")).toBeInTheDocument();
    expect(screen.getByText(/1\.3 heure\(s\)/)).toBeInTheDocument();
  });

  it("ajoute tempsSupplementaire à la durée", () => {
    render(
      <DureeTotaleEvenementField
        evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00", {
          tempsSupplementaire: 30,
        })}
      />,
    );
    expect(screen.getByDisplayValue("90")).toBeInTheDocument();
    expect(screen.getByText(/1\.5 heure\(s\)/)).toBeInTheDocument();
  });

  it("cumule tempsPreparation + tempsSupplementaire + durée", () => {
    render(
      <DureeTotaleEvenementField
        evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00", {
          tempsPreparation: 15,
          tempsSupplementaire: 45,
        })}
      />,
    );
    // 60 + 15 + 45 = 120
    expect(screen.getByDisplayValue("120")).toBeInTheDocument();
    expect(screen.getByText(/2\.0 heure\(s\)/)).toBeInTheDocument();
  });

  it("affiche 'minute' au singulier pour 1 minute totale", () => {
    render(
      <DureeTotaleEvenementField
        evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T10:01:00")}
      />,
    );
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByText("minute")).toBeInTheDocument();
  });

  it("l'input durée totale est désactivé", () => {
    render(
      <DureeTotaleEvenementField
        evenement={makeEv("2024-01-01T10:00:00", "2024-01-01T11:00:00")}
      />,
    );
    const input = screen.getByRole("textbox", { name: /durée totale de l'événement en minutes/i });
    expect(input).toBeDisabled();
  });
});
