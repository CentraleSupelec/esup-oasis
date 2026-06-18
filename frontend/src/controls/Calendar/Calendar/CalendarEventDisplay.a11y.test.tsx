import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { describe, it, expect, vi } from "vitest";
import { CalendarEventDisplay } from "./CalendarEventDisplay";
import { Evenement } from "@lib";

// TypeEvenementItem n'est rendu que si libelle est absent — on le mock par précaution.
vi.mock("@controls/Items/TypeEvenementItem", () => ({
  TypeEvenementItem: ({ typeEvenementId }: { typeEvenementId: string }) => (
    <span>{typeEvenementId}</span>
  ),
}));

// ─── Fixture ──────────────────────────────────────────────────────────────────

function makeCalendarEvenementData(overrides: Partial<Evenement> = {}): Evenement {
  const evt = new Evenement({
    "@id": "/evenements/1",
    "@type": "Evenement",
    debut: "2025-03-10T09:00:00",
    fin: "2025-03-10T10:00:00",
    libelle: "Cours de mathématiques",
    intervenant: "/utilisateurs/intervenant1",
    beneficiaires: ["/utilisateurs/etudiant1"],
    type: "/types_evenements/1",
    campus: "/campus/1",
    equipements: [],
  });
  return Object.assign(evt, overrides);
}

// ─── Y6 : CalendarEventDisplay — accessibilité ────────────────────────────────

describe("CalendarEventDisplay — accessibilité (Y6)", () => {
  const description =
    "Cours de mathématiques du lundi 10 mars 2025 de 09:00 à 10:00. " +
    "L'intervenant est défini. Aucun enseignant n'est lié.";

  it("aucune violation axe-core — événement standard", async () => {
    const { container } = render(
      <CalendarEventDisplay
        event={{ data: makeCalendarEvenementData() }}
        descriptionAccessible={description}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("le conteneur est focusable via le clavier (tabIndex=0)", () => {
    render(
      <CalendarEventDisplay
        event={{ data: makeCalendarEvenementData() }}
        descriptionAccessible={description}
      />,
    );
    const el = screen.getByText("Cours de mathématiques").closest("[tabindex]");
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("tabindex", "0");
  });

  it("l'aria-label contient la description accessible", () => {
    render(
      <CalendarEventDisplay
        event={{ data: makeCalendarEvenementData() }}
        descriptionAccessible={description}
      />,
    );
    const el = document.querySelector("[aria-label]");
    expect(el).toHaveAttribute("aria-label", description);
  });

  it("le libellé de l'événement est visible dans le DOM", () => {
    render(
      <CalendarEventDisplay
        event={{ data: makeCalendarEvenementData() }}
        descriptionAccessible={description}
      />,
    );
    expect(screen.getByText("Cours de mathématiques")).toBeInTheDocument();
  });

  it("l'icône d'annulation a un Tooltip accessible quand l'événement est annulé", async () => {
    const data = makeCalendarEvenementData({ dateAnnulation: "2025-03-09T12:00:00" });
    const { container } = render(
      <CalendarEventDisplay event={{ data }} descriptionAccessible={description} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("aucune violation axe-core — événement sans affectation (icône warning)", async () => {
    const data = makeCalendarEvenementData({ intervenant: undefined });
    const { container } = render(
      <CalendarEventDisplay event={{ data }} descriptionAccessible={description} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
