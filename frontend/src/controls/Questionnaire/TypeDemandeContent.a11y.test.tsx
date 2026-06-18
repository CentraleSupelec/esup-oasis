import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { App } from "antd";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TypeDemandeContent } from "./TypeDemandeContent";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const QUESTIONNAIRE = {
  "@id": "/demandes/1",
  typeDemandeId: "/types_demandes/1",
  libelle: "Test de saisie",
  complete: false,
  etapes: [
    { "@id": "/etapes/1", libelle: "Informations personnelles", questions: [] },
    { "@id": "/etapes/2", libelle: "Documents requis", questions: [] },
    { "@id": "/etapes/3", libelle: "Validation", questions: [] },
  ],
};

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockUseQuestionnaire, mockUseQuestionnaireNavigation } = vi.hoisted(() => ({
  mockUseQuestionnaire: vi.fn(),
  mockUseQuestionnaireNavigation: vi.fn(),
}));

vi.mock("@context/demande/QuestionnaireProvider", () => ({
  useQuestionnaire: mockUseQuestionnaire,
  useQuestionnaireNavigation: mockUseQuestionnaireNavigation,
}));

vi.mock("@controls/Questionnaire/EtapeDemande", () => ({
  EtapeDemande: ({ etapeIndex }: { etapeIndex: number }) => (
    <section aria-label={`Contenu de l'étape ${etapeIndex + 1}`}>
      <h2 id="etape-title" tabIndex={0}>
        {QUESTIONNAIRE.etapes[etapeIndex]?.libelle ?? "Étape"}
      </h2>
    </section>
  ),
}));

vi.mock("antd/es/grid/hooks/useBreakpoint", () => ({
  default: () => ({ lg: true, md: true }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNavReturn(etapeCourante: number) {
  return {
    etapeCourante,
    changementEtape: undefined,
    etapeSuivante: vi.fn(),
    etapePrecedente: vi.fn(),
  };
}

function makeQuestReturn(questionnaire = QUESTIONNAIRE) {
  return {
    questionnaire,
    form: undefined,
    questUtils: { getFormInitialValues: () => ({}) },
    submitting: false,
    blocage: false,
    mode: "saisie" as const,
    setMode: vi.fn(),
    setSubmitting: vi.fn(),
    setBlocage: vi.fn(),
    etatDemande: undefined,
    campagne: undefined,
  };
}

// ─── Y19 : TypeDemandeContent — accessibilité multi-étapes ───────────────────

describe("TypeDemandeContent — accessibilité multi-étapes (Y19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuestionnaire.mockReturnValue(makeQuestReturn());
  });

  // ── Étape 1 ────────────────────────────────────────────────────────────────

  describe("étape 1 (index 0)", () => {
    beforeEach(() => mockUseQuestionnaireNavigation.mockReturnValue(makeNavReturn(0)));

    it("aucune violation axe-core", async () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it("le texte sr-only décrit l'avancement à l'étape 1", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const srOnly = screen.getByText(/avancement dans le remplissage du questionnaire/i);
      expect(srOnly).toBeInTheDocument();
      expect(srOnly.textContent).toMatch(/étape 1/i);
      expect(srOnly.textContent).toMatch(/informations personnelles/i);
    });

    it("le stepper visuel est masqué aux technologies d'assistance", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const steps = document.querySelector(".ant-steps");
      expect(steps).toHaveAttribute("aria-hidden", "true");
    });

    it("le bouton 'Suivant' a un aria-label explicite", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      expect(
        screen.getByRole("button", { name: /passer à l.étape suivante/i }),
      ).toBeInTheDocument();
    });

    it("le bouton 'Précédent' n'est pas rendu à l'étape initiale", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      expect(
        screen.queryByRole("button", { name: /retourner à l.étape précédente/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ── Étape 2 ────────────────────────────────────────────────────────────────

  describe("étape 2 (index 1)", () => {
    beforeEach(() => mockUseQuestionnaireNavigation.mockReturnValue(makeNavReturn(1)));

    it("aucune violation axe-core", async () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it("les boutons Précédent et Suivant sont tous deux présents avec aria-label", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      expect(
        screen.getByRole("button", { name: /retourner à l.étape précédente/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /passer à l.étape suivante/i }),
      ).toBeInTheDocument();
    });

    it("le texte sr-only indique l'étape 2", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const srOnly = screen.getByText(/avancement dans le remplissage du questionnaire/i);
      expect(srOnly.textContent).toMatch(/étape 2/i);
      expect(srOnly.textContent).toMatch(/documents requis/i);
    });
  });

  // ── Dernière étape ─────────────────────────────────────────────────────────

  describe("dernière étape (index 2)", () => {
    beforeEach(() => mockUseQuestionnaireNavigation.mockReturnValue(makeNavReturn(2)));

    it("aucune violation axe-core", async () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });

    it("le bouton 'Précédent' a un aria-label explicite", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      expect(
        screen.getByRole("button", { name: /retourner à l.étape précédente/i }),
      ).toBeInTheDocument();
    });

    it("le bouton 'Suivant' n'est pas rendu à la dernière étape", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      expect(
        screen.queryByRole("button", { name: /passer à l.étape suivante/i }),
      ).not.toBeInTheDocument();
    });

    it("le texte sr-only indique l'étape 3", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      const srOnly = screen.getByText(/avancement dans le remplissage du questionnaire/i);
      expect(srOnly.textContent).toMatch(/étape 3/i);
      expect(srOnly.textContent).toMatch(/validation/i);
    });
  });

  // ── Questionnaire non chargé ───────────────────────────────────────────────

  describe("questionnaire non encore chargé", () => {
    beforeEach(() => {
      mockUseQuestionnaire.mockReturnValue({ ...makeQuestReturn(), questionnaire: undefined });
      mockUseQuestionnaireNavigation.mockReturnValue(makeNavReturn(0));
    });

    it("aucun bouton de navigation n'est rendu", () => {
      render(
        <App>
          <TypeDemandeContent />
        </App>,
      );
      expect(
        screen.queryByRole("button", { name: /passer à l.étape suivante/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /retourner à l.étape précédente/i }),
      ).not.toBeInTheDocument();
    });
  });
});
