import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { server } from "@/mocks/server";
import apiDownloader from "./apiDownloader";
import type { AuthContextType } from "@/auth/AuthProvider";

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return { ...actual, message: { ...actual.message, error: vi.fn().mockResolvedValue(undefined) } };
});

const FILE_URL = "http://api.test/file.pdf";
const NO_IMPERSONATE = { impersonate: undefined } as unknown as AuthContextType;
const WITH_IMPERSONATE = { impersonate: "agent@test.fr" } as unknown as AuthContextType;

describe("apiDownloader", () => {
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:fake"),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it("téléchargement réussi → createObjectURL → click → revokeObjectURL → onSuccess", async () => {
    server.use(http.get(FILE_URL, () => new HttpResponse("file content", { status: 200 })));
    const onSuccess = vi.fn();

    apiDownloader(FILE_URL, NO_IMPERSONATE, {}, "test.pdf", onSuccess);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });

  it("réponse HTTP erreur → onError appelé, createObjectURL non appelé", async () => {
    server.use(http.get(FILE_URL, () => new HttpResponse(null, { status: 500 })));
    const onError = vi.fn();

    apiDownloader(FILE_URL, NO_IMPERSONATE, {}, "test.pdf", undefined, onError);

    await waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("header X-Switch-User présent si impersonate défini", async () => {
    let capturedHeaders: Headers | undefined;
    server.use(
      http.get(FILE_URL, ({ request }) => {
        capturedHeaders = request.headers;
        return new HttpResponse("file content", { status: 200 });
      }),
    );

    apiDownloader(FILE_URL, WITH_IMPERSONATE, {}, "test.pdf");

    await waitFor(() => expect(capturedHeaders).toBeDefined());
    expect(capturedHeaders!.get("X-Switch-User")).toBe("agent@test.fr");
  });
});
