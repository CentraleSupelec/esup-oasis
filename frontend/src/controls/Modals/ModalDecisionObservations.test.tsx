/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModalDecisionObservations } from "./ModalDecisionObservations";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockUseGetItem, mockMutate, mockUsePatch } = vi.hoisted(() => ({
  mockUseGetItem: vi.fn(),
  mockMutate: vi.fn(),
  mockUsePatch: vi.fn(),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetItem: mockUseGetItem,
    usePatch: mockUsePatch,
  }),
}));

/**
 * Récupère la `<textarea>` du champ « Observations particulières » en évitant
 * le `<input>` du DatePicker qui partage également le rôle ARIA "textbox".
 */
async function findObservationsTextarea(): Promise<HTMLTextAreaElement> {
  const textboxes = await screen.findAllByRole("textbox");
  const textarea = textboxes.find((el): el is HTMLTextAreaElement => el.tagName === "TEXTAREA");
  if (!textarea) {
    throw new Error("Textarea 'Observations particulières' introuvable");
  }
  return textarea;
}

describe("ModalDecisionObservations — formulaire d'observations particulières", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({
      data: {
        "@id": "/utilisateurs/test@uni.fr/decisions/2026",
        etat: "ATTENTE_VALIDATION_CAS",
        observations: "",
        dateAvisMedecin: null,
      },
      isFetching: false,
    });
    mockUsePatch.mockReturnValue({ mutate: mockMutate, isPending: false });
  });

  function renderModal(open = true) {
    return render(
      <App>
        <ModalDecisionObservations
          open={open}
          setOpen={vi.fn()}
          decisionId="/utilisateurs/test@uni.fr/decisions/2026"
          utilisateurId="test@uni.fr"
        />
      </App>,
    );
  }

  it("affiche un textarea 'Observations particulières'", async () => {
    renderModal();
    await screen.findByRole("dialog");

    const textarea = await findObservationsTextarea();
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("affiche un DatePicker 'Date de l'avis médical CDAPH'", async () => {
    renderModal();
    await screen.findByRole("dialog");

    // Le label apparaît dans le formulaire. Le DatePicker AntD expose un input
    // avec le placeholder configuré ; on s'appuie sur lui pour cibler le champ.
    const datePickerInput = await screen.findByPlaceholderText("JJ/MM/AAAA");
    expect(datePickerInput).toBeInTheDocument();
    expect(screen.getByText(/Date de l'avis médical CDAPH/i)).toBeInTheDocument();
  });

  it("pré-remplit le DatePicker avec la date renvoyée par l'API", async () => {
    mockUseGetItem.mockReturnValue({
      data: {
        "@id": "/utilisateurs/test@uni.fr/decisions/2026",
        etat: "ATTENTE_VALIDATION_CAS",
        observations: "",
        dateAvisMedecin: "2026-06-15",
      },
      isFetching: false,
    });
    renderModal();
    await screen.findByRole("dialog");

    const datePickerInput = (await screen.findByPlaceholderText("JJ/MM/AAAA")) as HTMLInputElement;
    await waitFor(() => {
      expect(datePickerInput.value).toBe("15/06/2026");
    });
  });

  it("accepte la saisie utilisateur et la transmet via PATCH", async () => {
    const user = userEvent.setup();
    renderModal();
    await screen.findByRole("dialog");

    const textarea = await findObservationsTextarea();
    await user.click(textarea);
    await user.type(textarea, "Tiers temps validé sur dossier 2026");

    const okButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockMutate).toHaveBeenCalledWith({
      "@id": "/utilisateurs/test@uni.fr/decisions/2026",
      data: { observations: "Tiers temps validé sur dossier 2026", dateAvisMedecin: null },
    });
  });

  it("transmet dateAvisMedecin au format ISO YYYY-MM-DD via PATCH", async () => {
    const user = userEvent.setup();
    // Pré-remplir via les données d'API : on évite la simulation de saisie
    // clavier dans le DatePicker AntD, peu reproductible en JSDOM (le portail
    // calendar ne s'affiche pas et la touche `Enter` déclenche un submit).
    mockUseGetItem.mockReturnValue({
      data: {
        "@id": "/utilisateurs/test@uni.fr/decisions/2026",
        etat: "ATTENTE_VALIDATION_CAS",
        observations: "",
        dateAvisMedecin: "2026-06-15",
      },
      isFetching: false,
    });
    renderModal();
    await screen.findByRole("dialog");

    // On vérifie que le DatePicker est bien pré-rempli avec la valeur attendue
    // avant de soumettre, afin de s'assurer que l'on testera bien le format
    // ISO en sortie.
    const datePickerInput = (await screen.findByPlaceholderText("JJ/MM/AAAA")) as HTMLInputElement;
    await waitFor(() => {
      expect(datePickerInput.value).toBe("15/06/2026");
    });

    const okButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockMutate).toHaveBeenCalledWith({
      "@id": "/utilisateurs/test@uni.fr/decisions/2026",
      data: { observations: null, dateAvisMedecin: "2026-06-15" },
    });
  });

  it("envoie null pour les deux champs quand la saisie est vide", async () => {
    const user = userEvent.setup();
    mockUseGetItem.mockReturnValue({
      data: {
        "@id": "/utilisateurs/test@uni.fr/decisions/2026",
        etat: "ATTENTE_VALIDATION_CAS",
        observations: "    ",
        dateAvisMedecin: null,
      },
      isFetching: false,
    });
    renderModal();
    await screen.findByRole("dialog");

    const textarea = await findObservationsTextarea();
    await user.clear(textarea);

    const okButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockMutate).toHaveBeenCalledWith({
      "@id": "/utilisateurs/test@uni.fr/decisions/2026",
      data: { observations: null, dateAvisMedecin: null },
    });
  });
});
