import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { App } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EvenementResumeModal from "./EvenementResumeModal";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockSetModalEvenementId, mockSetModalEvenement } = vi.hoisted(() => ({
  mockSetModalEvenementId: vi.fn(),
  mockSetModalEvenement: vi.fn(),
}));

vi.mock("@context/modals/ModalsContext", () => ({
  useModals: () => ({
    modals: {},
    setModalEvenementId: mockSetModalEvenementId,
    setModalEvenement: mockSetModalEvenement,
  }),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetItem: () => ({ data: undefined, isFetching: false }),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { isIntervenant: false } }),
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true }),
}));

vi.mock("@controls/Modals/Evenement/EvenementResume/EvenementResumeInformations", () => ({
  EvenementResumeInformations: () => <section aria-label="Informations">Informations</section>,
}));
vi.mock("@controls/Modals/Evenement/EvenementResume/EvenementResumeAutresInformations", () => ({
  EvenementResumeAutresInformations: () => (
    <section aria-label="Autres informations">Autres informations</section>
  ),
}));
vi.mock("@controls/Modals/Evenement/EvenementResume/EvenementResumeParticipants", () => ({
  EvenementResumeParticipants: () => <section aria-label="Participants">Participants</section>,
}));
vi.mock("@controls/Images/EtudiantClassroomImage", () => ({ default: () => null }));

// ─── Y3 : EvenementResumeModal — accessibilité ────────────────────────────────

describe("EvenementResumeModal — accessibilité (Y3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("expose role='dialog' avec aria-modal='true'", async () => {
    render(
      <App>
        <EvenementResumeModal id="/evenements/1" />
      </App>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("aucune violation axe-core (modale ouverte)", async () => {
    render(
      <App>
        <EvenementResumeModal id="/evenements/1" />
      </App>,
    );
    await screen.findByRole("dialog");
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("le titre 'Détails de l'évènement' est lisible dans la modale", async () => {
    render(
      <App>
        <EvenementResumeModal id="/evenements/1" />
      </App>,
    );
    await screen.findByRole("dialog");
    expect(screen.getByText(/détails de l'évènement/i)).toBeInTheDocument();
  });

  it("Esc ferme la modale (appelle setModalEvenementId + setModalEvenement avec undefined)", async () => {
    const user = userEvent.setup();
    render(
      <App>
        <EvenementResumeModal id="/evenements/1" />
      </App>,
    );
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(mockSetModalEvenementId).toHaveBeenCalledWith(undefined);
    expect(mockSetModalEvenement).toHaveBeenCalledWith(undefined);
  });

  it("le bouton de fermeture est un élément button accessible", async () => {
    render(
      <App>
        <EvenementResumeModal id="/evenements/1" />
      </App>,
    );
    await screen.findByRole("dialog");
    const closeBtn = document.querySelector(".ant-modal-close");
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.tagName.toLowerCase()).toBe("button");
  });

  it("expose role='dialog' dans l'état skeleton (isFetching)", async () => {
    // Override useGetItem for this test to simulate loading
    vi.doMock("@context/api/ApiProvider", () => ({
      useApi: () => ({
        useGetItem: () => ({ data: undefined, isFetching: true }),
      }),
    }));

    const { default: EvenementResumeModalLoading } = await import("./EvenementResumeModal");
    render(
      <App>
        <EvenementResumeModalLoading id="/evenements/1" />
      </App>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });
});
