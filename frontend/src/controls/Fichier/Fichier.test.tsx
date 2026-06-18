/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "antd";
import { Fichier } from "./Fichier";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/env", () => ({ env: { REACT_APP_API: "http://api.test" } }));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ token: "tok", impersonate: undefined }),
}));

const mockApiDownloader = vi.fn(() => Promise.resolve());
vi.mock("@utils/apiDownloader", () => ({
  default: (...args: unknown[]) =>
    (mockApiDownloader as (...a: unknown[]) => Promise<void>)(...args),
}));

vi.mock("@controls/Questionnaire/Question/TelechargementImagePreview", () => ({
  default: () => <span data-testid="image-preview" />,
}));

vi.mock("@controls/Spinner/Spinner", () => ({
  default: () => <span data-testid="spinner" />,
}));

const mockUseGetItem = vi.fn();
vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({ useGetItem: mockUseGetItem }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFichier(overrides: Record<string, unknown> = {}) {
  return {
    "@id": "/telechargements/1",
    nom: "document.pdf",
    typeMime: "application/pdf",
    urlContenu: "/fichiers/document.pdf",
    ...overrides,
  };
}

function renderFichier(props: Partial<Parameters<typeof Fichier>[0]> = {}) {
  return render(
    <App>
      <Fichier fichierId="/telechargements/1" {...props} />
    </App>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Fichier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({ data: makeFichier(), isFetching: false });
  });

  // --- États de chargement --------------------------------------------------

  it("affiche un spinner pendant le chargement (isFetching)", () => {
    mockUseGetItem.mockReturnValue({ data: undefined, isFetching: true });
    renderFichier();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("affiche un spinner si la prop loading est vraie", () => {
    renderFichier({ loading: true });
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("ne rend rien si le fichier est introuvable après chargement", () => {
    mockUseGetItem.mockReturnValue({ data: null, isFetching: false });
    renderFichier();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // --- Rendu nominal --------------------------------------------------------

  it("affiche le nom du fichier", () => {
    renderFichier();
    expect(screen.getByText("document.pdf")).toBeInTheDocument();
  });

  it("affiche le bouton de téléchargement par défaut", () => {
    renderFichier();
    expect(
      screen.getByRole("button", { name: /télécharger la pièce justificative document\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("transmet l'IRI correcte à useGetItem", () => {
    renderFichier({ fichierId: "/telechargements/42" });
    expect(mockUseGetItem).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/telechargements/42" }),
    );
  });

  it("désactive useGetItem quand fichierId est vide", () => {
    mockUseGetItem.mockReturnValue({ data: null, isFetching: false });
    renderFichier({ fichierId: "" });
    expect(mockUseGetItem).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  // --- Téléchargement -------------------------------------------------------

  it("déclenche apiDownloader au clic sur le bouton Télécharger", async () => {
    renderFichier();
    fireEvent.click(screen.getByRole("button", { name: /télécharger la pièce justificative/i }));
    await waitFor(() => expect(mockApiDownloader).toHaveBeenCalledOnce());
    expect(mockApiDownloader).toHaveBeenCalledWith(
      "http://api.test/fichiers/document.pdf",
      expect.any(Object),
      {},
      "document.pdf",
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("déclenche apiDownloader au clic sur le nom du fichier", async () => {
    renderFichier();
    fireEvent.click(screen.getByText("document.pdf"));
    await waitFor(() => expect(mockApiDownloader).toHaveBeenCalledOnce());
  });

  // --- Props de visibilité --------------------------------------------------

  it("masque le libellé si hideLibelle est vrai", () => {
    renderFichier({ hideLibelle: true });
    expect(screen.queryByText("document.pdf")).not.toBeInTheDocument();
  });

  it("masque le bouton Télécharger si hideDownload est vrai", () => {
    renderFichier({ hideDownload: true });
    expect(
      screen.queryByRole("button", { name: /télécharger la pièce justificative/i }),
    ).not.toBeInTheDocument();
  });

  it("n'affiche pas de texte sur le bouton quand onlyIcon est vrai", () => {
    renderFichier({ onlyIcon: true });
    // Le bouton reste accessible via son aria-label
    expect(
      screen.getByRole("button", { name: /télécharger la pièce justificative/i }),
    ).toBeInTheDocument();
    // Le texte "Télécharger" n'est pas rendu
    expect(screen.queryByText("Télécharger")).not.toBeInTheDocument();
  });

  // --- Actions onRemove / onEdit --------------------------------------------

  it("affiche le bouton de suppression si onRemove est fourni", () => {
    renderFichier({ onRemove: vi.fn() });
    expect(
      screen.getByRole("button", { name: /supprimer la pièce justificative document\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("n'affiche pas le bouton de suppression sans prop onRemove", () => {
    renderFichier();
    expect(screen.queryByRole("button", { name: /supprimer/i })).not.toBeInTheDocument();
  });

  it("ouvre le popconfirm de suppression au clic et appelle onRemove après confirmation", async () => {
    const onRemove = vi.fn();
    renderFichier({ onRemove });

    fireEvent.click(screen.getByRole("button", { name: /supprimer la pièce justificative/i }));

    const confirmBtn = await screen.findByRole("button", { name: /oui, supprimer/i });
    fireEvent.click(confirmBtn);

    expect(onRemove).toHaveBeenCalledWith("/telechargements/1");
  });

  it("affiche le bouton d'édition si onEdit est fourni", () => {
    renderFichier({ onEdit: vi.fn() });
    expect(
      screen.getByRole("button", { name: /modifier la pièce justificative document\.pdf/i }),
    ).toBeInTheDocument();
  });

  it("appelle onEdit au clic sur Éditer", () => {
    const onEdit = vi.fn();
    renderFichier({ onEdit });
    fireEvent.click(screen.getByRole("button", { name: /modifier la pièce justificative/i }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  // --- Types de fichier -----------------------------------------------------

  it("affiche TelechargementImagePreview pour un fichier image", () => {
    mockUseGetItem.mockReturnValue({
      data: makeFichier({ typeMime: "image/jpeg" }),
      isFetching: false,
    });
    renderFichier();
    expect(screen.getByTestId("image-preview")).toBeInTheDocument();
  });

  it("n'affiche pas TelechargementImagePreview pour un fichier non-image", () => {
    renderFichier(); // typeMime: "application/pdf"
    expect(screen.queryByTestId("image-preview")).not.toBeInTheDocument();
  });
});
