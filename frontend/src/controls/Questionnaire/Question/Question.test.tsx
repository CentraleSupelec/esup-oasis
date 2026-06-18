/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Question } from "./Question";

// Le dispatcher route vers un composant feuille selon `typeReponse` :
// on stube chaque feuille pour vérifier le routage sans rendre tout l'arbre.
vi.mock("@controls/Questionnaire/Question/QuestionText", () => ({
  QuestionText: () => <div data-testid="QuestionText" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionNumeric", () => ({
  QuestionNumeric: () => <div data-testid="QuestionNumeric" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionTextarea", () => ({
  QuestionTextarea: () => <div data-testid="QuestionTextarea" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionCheckbox", () => ({
  QuestionCheckbox: () => <div data-testid="QuestionCheckbox" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionDate", () => ({
  QuestionDate: () => <div data-testid="QuestionDate" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionFile", () => ({
  QuestionFile: () => <div data-testid="QuestionFile" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionRadio", () => ({
  QuestionRadio: () => <div data-testid="QuestionRadio" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionSelect", () => ({
  QuestionSelect: () => <div data-testid="QuestionSelect" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionInfo", () => ({
  QuestionInfo: () => <div data-testid="QuestionInfo" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionSubmit", () => ({
  QuestionSubmit: () => <div data-testid="QuestionSubmit" />,
}));
vi.mock("@controls/Questionnaire/Question/QuestionBlocage", () => ({
  QuestionBlocage: () => <div data-testid="QuestionBlocage" />,
}));

const mockUseGetItem = vi.fn(() => ({ data: undefined }));
vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({ useGetItem: mockUseGetItem }),
}));

function renderQuestion(question: Record<string, unknown>) {
  return render(<Question question={question as never} />);
}

describe("Question — routage selon le type de réponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetItem.mockReturnValue({ data: undefined });
  });

  it.each([
    ["text", "QuestionText"],
    ["numeric", "QuestionNumeric"],
    ["textarea", "QuestionTextarea"],
    ["checkbox", "QuestionCheckbox"],
    ["date", "QuestionDate"],
    ["file", "QuestionFile"],
    ["radio", "QuestionRadio"],
    ["select", "QuestionSelect"],
    ["submit", "QuestionSubmit"],
  ])("type « %s » → rend %s", (typeReponse, testid) => {
    renderQuestion({ "@id": "/questions/1", typeReponse, obligatoire: false });
    expect(screen.getByTestId(testid)).toBeInTheDocument();
  });

  it("type « info » non obligatoire → QuestionInfo", () => {
    renderQuestion({ "@id": "/questions/1", typeReponse: "info", obligatoire: false });
    expect(screen.getByTestId("QuestionInfo")).toBeInTheDocument();
    expect(screen.queryByTestId("QuestionBlocage")).not.toBeInTheDocument();
  });

  it("type « info » obligatoire → QuestionBlocage (bloque la progression)", () => {
    renderQuestion({ "@id": "/questions/1", typeReponse: "info", obligatoire: true });
    expect(screen.getByTestId("QuestionBlocage")).toBeInTheDocument();
    expect(screen.queryByTestId("QuestionInfo")).not.toBeInTheDocument();
  });

  it("type inconnu → message d'erreur explicite", () => {
    renderQuestion({ "@id": "/questions/1", typeReponse: "martien", obligatoire: false });
    expect(screen.getByText("Type de question inconnu.")).toBeInTheDocument();
  });

  it("aucune question disponible → affiche un Spin de chargement", () => {
    const { container } = render(<Question />);
    expect(container.querySelector(".ant-spin")).toBeInTheDocument();
  });
});
