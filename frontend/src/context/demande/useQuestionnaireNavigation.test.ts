import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FormInstance } from "antd";
import { useQuestionnaireNavigation } from "./useQuestionnaireNavigation";
import type { Questionnaire } from "./QuestionnaireTypes";

const QUESTIONNAIRE_3_ETAPES = {
  "@id": "/demandes/1",
  typeDemandeId: "/types_demandes/1",
  libelle: "Test",
  complete: false,
  etapes: [
    { "@id": "/etapes/1", questions: [] },
    { "@id": "/etapes/2", questions: [] },
    { "@id": "/etapes/3", questions: [] },
  ],
} satisfies Questionnaire;

let mockValidateFields: ReturnType<typeof vi.fn>;
let form: FormInstance;

beforeEach(() => {
  vi.clearAllMocks();
  mockValidateFields = vi.fn();
  form = { validateFields: mockValidateFields } as unknown as FormInstance;
  window.scrollTo = vi.fn();
  vi.spyOn(document, "getElementById").mockReturnValue({
    focus: vi.fn(),
  } as unknown as HTMLElement);
});

// ---------------------------------------------------------------------------
// useQuestionnaireNavigation
// ---------------------------------------------------------------------------

describe("useQuestionnaireNavigation", () => {
  it("état initial : etapeCourante = 0, changementEtape = undefined", () => {
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );
    expect(result.current.etapeCourante).toBe(0);
    expect(result.current.changementEtape).toBeUndefined();
  });

  it("etapeSuivante() quand questionnaire undefined → ne change pas l'état", () => {
    const { result } = renderHook(() => useQuestionnaireNavigation({ form }));
    act(() => {
      result.current.etapeSuivante();
    });
    expect(result.current.etapeCourante).toBe(0);
    expect(result.current.changementEtape).toBeUndefined();
  });

  it("etapeSuivante() à la dernière étape (index 2) → ne dépasse pas", () => {
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );
    act(() => {
      result.current.setEtapeCourante(2);
    });
    act(() => {
      result.current.etapeSuivante();
    });
    expect(result.current.etapeCourante).toBe(2);
    expect(mockValidateFields).not.toHaveBeenCalled();
  });

  it("etapeSuivante() avec validateFields résolu → incrémente etapeCourante, remet changementEtape", async () => {
    mockValidateFields.mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );

    act(() => {
      result.current.etapeSuivante();
    });

    await waitFor(() => expect(result.current.etapeCourante).toBe(1));
    expect(result.current.changementEtape).toBeUndefined();
  });

  it("etapeSuivante() avec validateFields rejeté → appelle onError, etapeCourante inchangé", async () => {
    const validationError = new Error("champs invalides");
    mockValidateFields.mockRejectedValue(validationError);
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form, onError }),
    );

    act(() => {
      result.current.etapeSuivante();
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(validationError));
    expect(result.current.etapeCourante).toBe(0);
    expect(result.current.changementEtape).toBeUndefined();
  });

  it("etapePrecedente() à l'étape 0 → ne décrémente pas, validateFields non appelé", () => {
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );
    act(() => {
      result.current.etapePrecedente();
    });
    expect(result.current.etapeCourante).toBe(0);
    expect(mockValidateFields).not.toHaveBeenCalled();
  });

  it("etapePrecedente() depuis étape 2 avec validateFields résolu → décrémente, remet changementEtape", async () => {
    mockValidateFields.mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );

    act(() => {
      result.current.setEtapeCourante(2);
    });
    act(() => {
      result.current.etapePrecedente();
    });

    await waitFor(() => expect(result.current.etapeCourante).toBe(1));
    expect(result.current.changementEtape).toBeUndefined();
  });

  it("setEtapeCourante peut être appelé directement pour sauter plusieurs étapes", () => {
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );
    act(() => {
      result.current.setEtapeCourante(2);
    });
    expect(result.current.etapeCourante).toBe(2);
  });

  // --- Compléments : état transitoire, rejet sur précédente, étapes absentes ---

  it("etapeSuivante() : changementEtape vaut 'next' pendant la validation en attente", () => {
    mockValidateFields.mockReturnValue(new Promise(() => {})); // jamais résolue
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );
    act(() => {
      result.current.etapeSuivante();
    });
    expect(result.current.changementEtape).toBe("next");
    expect(result.current.etapeCourante).toBe(0);
  });

  it("etapePrecedente() : changementEtape vaut 'previous' pendant la validation en attente", () => {
    mockValidateFields.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form }),
    );
    act(() => {
      result.current.setEtapeCourante(2);
    });
    act(() => {
      result.current.etapePrecedente();
    });
    expect(result.current.changementEtape).toBe("previous");
  });

  it("etapePrecedente() avec validateFields rejeté → onError, étape inchangée", async () => {
    const validationError = new Error("champs invalides");
    mockValidateFields.mockRejectedValue(validationError);
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: QUESTIONNAIRE_3_ETAPES, form, onError }),
    );

    act(() => {
      result.current.setEtapeCourante(2);
    });
    act(() => {
      result.current.etapePrecedente();
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(validationError));
    expect(result.current.etapeCourante).toBe(2);
    expect(result.current.changementEtape).toBeUndefined();
  });

  it("etapeSuivante() : questionnaire sans tableau d'étapes → no-op sans erreur", () => {
    const sansEtapes = { ...QUESTIONNAIRE_3_ETAPES, etapes: undefined } as unknown as Questionnaire;
    const { result } = renderHook(() =>
      useQuestionnaireNavigation({ questionnaire: sansEtapes, form }),
    );
    act(() => {
      result.current.etapeSuivante();
    });
    expect(result.current.etapeCourante).toBe(0);
    expect(mockValidateFields).not.toHaveBeenCalled();
  });
});
