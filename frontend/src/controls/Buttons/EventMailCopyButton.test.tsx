/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { App } from "antd";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EventMailCopyButton from "./EventMailCopyButton";
import { IEvenement } from "@api";

// UtilisateurEmailItem charge l'API — on le mocke pour rester en test unitaire.
vi.mock("@controls/Items/UtilisateurEmailItem", () => ({
  UtilisateurEmailItem: ({ utilisateurId }: { utilisateurId: string }) =>
    `email-${utilisateurId}@example.com`,
}));

const writeText = vi.fn().mockResolvedValue(undefined);
const windowOpen = vi.fn();

beforeEach(() => {
  writeText.mockClear();
  windowOpen.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    writable: true,
    configurable: true,
  });
  vi.stubGlobal("open", windowOpen);
});

function makeEvenement(overrides?: Partial<IEvenement>): IEvenement {
  return {
    "@id": "/evenements/1",
    debut: "2026-06-16T09:00:00",
    fin: "2026-06-16T10:00:00",
    ...overrides,
  } as IEvenement;
}

function renderButton(evenement: IEvenement | undefined) {
  return render(
    <App>
      <EventMailCopyButton evenement={evenement} />
    </App>,
  );
}

// ---------------------------------------------------------------------------
// Rendu conditionnel
// ---------------------------------------------------------------------------

describe("EventMailCopyButton — rendu conditionnel", () => {
  it("ne rend pas de bouton quand evenement est undefined", () => {
    renderButton(undefined);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("rend le bouton mail quand evenement est défini", () => {
    renderButton(makeEvenement());
    expect(
      screen.getByRole("button", { name: "Copier les adresses email des participants" }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Aria et accessibilité
// ---------------------------------------------------------------------------

describe("EventMailCopyButton — accessibilité", () => {
  it("le bouton porte un aria-label explicite", () => {
    renderButton(makeEvenement());
    expect(
      screen.getByRole("button", { name: "Copier les adresses email des participants" }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Comportement au clic — copie presse-papier
// ---------------------------------------------------------------------------

describe("EventMailCopyButton — copie au clic", () => {
  it("appelle navigator.clipboard.writeText au clic direct sur le bouton", () => {
    renderButton(makeEvenement({ beneficiaires: ["/utilisateurs/u1"] }));
    const btn = screen.getByRole("button", { name: "Copier les adresses email des participants" });
    fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("copie une chaîne vide quand l'événement n'a pas de participants", () => {
    // innerText n'est pas supporté par JSDOM → le ref retourne une chaîne vide
    renderButton(makeEvenement({ beneficiaires: [], intervenant: undefined }));
    const btn = screen.getByRole("button", { name: "Copier les adresses email des participants" });
    fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("");
  });
});
