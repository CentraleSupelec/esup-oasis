import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { QuestionnaireQuestion } from "@context/demande/QuestionnaireProvider";

// --- Hoisted mocks ---
const { mockNotifError, mockNotifSuccess, mockSetSubmitting, mockEnvoyerReponse } = vi.hoisted(
  () => ({
    mockNotifError: vi.fn(),
    mockNotifSuccess: vi.fn(),
    mockSetSubmitting: vi.fn(),
    mockEnvoyerReponse: vi.fn(),
  }),
);

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({
        notification: { error: mockNotifError, success: mockNotifSuccess },
      }),
    },
  };
});

vi.mock("@context/demande/QuestionnaireProvider", () => ({
  useQuestionnaire: () => ({
    mode: "saisie",
    form: undefined,
    questUtils: { envoyerReponse: mockEnvoyerReponse },
    setSubmitting: mockSetSubmitting,
  }),
}));

vi.mock("@utils/upload");
vi.mock("@utils/fichierValidation");

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ token: "tok", impersonate: undefined }),
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

vi.mock("@/env", async () => {
  const { makeTestEnv } = await import("@/test/env");
  return { env: makeTestEnv({ REACT_APP_API: "https://api.test" }) };
});

import { envoyerFichierFetch } from "@utils/upload";
import { validerFichier } from "@utils/fichierValidation";
import { useQuestionFileUpload } from "./useQuestionFileUpload";

const mockEnvoyerFichierFetch = vi.mocked(envoyerFichierFetch);
const mockValiderFichier = vi.mocked(validerFichier);

function makeFile(uid = "uid-test") {
  const f = new File(["content"], "test.pdf", { type: "application/pdf" }) as File & {
    uid: string;
  };
  f.uid = uid;
  return f;
}

const question: QuestionnaireQuestion = {
  "@id": "/questions/1",
  libelle: "Pièce justificative",
  typeReponse: "file",
  obligatoire: false,
  choixMultiple: false,
};

describe("useQuestionFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValiderFichier.mockReturnValue(null);
    mockEnvoyerReponse.mockImplementation(
      (_id: unknown, _type: unknown, _reponse: unknown, callback?: () => void) => callback?.(),
    );
  });

  it("fichier invalide : notification.error appelé, envoyerFichierFetch non appelé", async () => {
    mockValiderFichier.mockReturnValue("Extension non supportée");
    const { result } = renderHook(() => useQuestionFileUpload(question));
    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file: makeFile(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
        } as never,
        {} as never,
      ),
    );
    expect(mockNotifError).toHaveBeenCalledOnce();
    expect(mockEnvoyerFichierFetch).not.toHaveBeenCalled();
  });

  it("fichier valide : envoyerFichierFetch est appelé avec le fichier", async () => {
    mockEnvoyerFichierFetch.mockResolvedValue(undefined);
    const file = makeFile();
    const { result } = renderHook(() => useQuestionFileUpload(question));
    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file,
          onSuccess: vi.fn(),
          onError: vi.fn(),
        } as never,
        {} as never,
      ),
    );
    expect(mockEnvoyerFichierFetch).toHaveBeenCalledOnce();
    expect(mockEnvoyerFichierFetch).toHaveBeenCalledWith(
      "https://api.test",
      expect.objectContaining({ token: "tok" }),
      file,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("erreur réseau : onError est appelé avec l'erreur", async () => {
    const err = new Error("Network error");
    mockEnvoyerFichierFetch.mockImplementation(async (_url, _auth, _file, _onSuccess, onError) => {
      onError?.(err);
    });
    const { result } = renderHook(() => useQuestionFileUpload(question));
    const onError = vi.fn();
    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file: makeFile(),
          onSuccess: vi.fn(),
          onError,
        } as never,
        {} as never,
      ),
    );
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("upload réussi : questUtils.envoyerReponse est appelé avec le bon PJ id", async () => {
    mockEnvoyerFichierFetch.mockImplementation(async (_url, _auth, _file, onSuccess) => {
      onSuccess?.({ "@id": "/pieces_justificatives/1" } as never);
    });
    const { result } = renderHook(() => useQuestionFileUpload(question));
    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file: makeFile(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
        } as never,
        {} as never,
      ),
    );
    await waitFor(() => expect(mockEnvoyerReponse).toHaveBeenCalledOnce());
    expect(mockEnvoyerReponse).toHaveBeenCalledWith(
      question["@id"],
      "file",
      ["/pieces_justificatives/1"],
      expect.any(Function),
    );
  });

  it("upload réussi : onSuccess du composant Ant Design appelé avec 'ok'", async () => {
    mockEnvoyerFichierFetch.mockImplementation(async (_url, _auth, _file, onSuccess) => {
      onSuccess?.({ "@id": "/pieces_justificatives/42" } as never);
    });
    const { result } = renderHook(() => useQuestionFileUpload(question));
    const onSuccess = vi.fn();
    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file: makeFile(),
          onSuccess,
          onError: vi.fn(),
        } as never,
        {} as never,
      ),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("ok"));
  });

  it("erreur réseau : notification.error affichée en plus du callback onError", async () => {
    const err = new Error("Network error");
    mockEnvoyerFichierFetch.mockImplementation(async (_url, _auth, _file, _onSuccess, onError) => {
      onError?.(err);
    });
    const { result } = renderHook(() => useQuestionFileUpload(question));
    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file: makeFile(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
        } as never,
        {} as never,
      ),
    );
    expect(mockNotifError).toHaveBeenCalledOnce();
  });

  it("état uploading : true pendant l'upload, false une fois terminé", async () => {
    let resolveWithSuccess!: () => void;
    mockEnvoyerFichierFetch.mockImplementation(
      (_url, _auth, _file, onSuccess) =>
        new Promise<void>((r) => {
          resolveWithSuccess = () => {
            onSuccess?.({ "@id": "/pieces_justificatives/99" } as never);
            r();
          };
        }),
    );
    const { result } = renderHook(() => useQuestionFileUpload(question));

    act(() => {
      result.current.uploadProps.customRequest!(
        { file: makeFile(), onSuccess: vi.fn(), onError: vi.fn() } as never,
        {} as never,
      );
    });

    await waitFor(() => expect(result.current.uploading).toBe(true));

    await act(async () => resolveWithSuccess());

    await waitFor(() => expect(result.current.uploading).toBe(false));
  });

  it("progression : fileList du fichier en cours est mis à jour avec le pourcentage", async () => {
    mockEnvoyerFichierFetch.mockImplementation(
      async (_url, _auth, _file, _onS, _onE, onProgress) => {
        onProgress?.(75);
      },
    );
    const file = makeFile("uid-prog");
    const { result } = renderHook(() => useQuestionFileUpload(question));

    // Simulate Ant Design Upload calling onChange when the file starts uploading
    act(() => {
      result.current.uploadProps.onChange?.({
        file: { uid: file.uid, name: file.name, status: "uploading" } as never,
        fileList: [],
      });
    });

    await act(() =>
      result.current.uploadProps.customRequest!(
        {
          file,
          onSuccess: vi.fn(),
          onError: vi.fn(),
        } as never,
        {} as never,
      ),
    );

    expect(result.current.fileList.find((f) => f.uid === file.uid)?.percent).toBe(75);
  });
});
