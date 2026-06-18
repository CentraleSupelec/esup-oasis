// NOTE: le cas "si le texte change → recommence depuis 0" est intentionnellement absent.
// Le useEffect a des deps vides [] — les options sont stables au montage par conception
// (voir commentaire dans la source). Le hook ne réagit pas aux changements post-montage.

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTypedText } from "./useTypedText";

describe("useTypedText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('strings = [] → text reste ""', () => {
    const { result } = renderHook(() => useTypedText({ strings: [] }));
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.text).toBe("");
    expect(result.current.showCursor).toBe(false);
  });

  it("avant startDelay : text vide, showCursor false", () => {
    const { result } = renderHook(() =>
      useTypedText({ strings: ["abc"], startDelay: 100, typeSpeed: 50 }),
    );
    expect(result.current.text).toBe("");
    expect(result.current.showCursor).toBe(false);
  });

  it("après chaque tick (typeSpeed) : un caractère de plus est affiché", () => {
    const { result } = renderHook(() =>
      useTypedText({ strings: ["abc"], startDelay: 100, typeSpeed: 50 }),
    );

    act(() => {
      vi.advanceTimersByTime(100); // startDelay → premier char
    });
    expect(result.current.text).toBe("a");
    expect(result.current.showCursor).toBe(true);

    act(() => {
      vi.advanceTimersByTime(50); // typeSpeed → deuxième char
    });
    expect(result.current.text).toBe("ab");

    act(() => {
      vi.advanceTimersByTime(50); // typeSpeed → troisième char
    });
    expect(result.current.text).toBe("abc");
  });

  it("après startDelay + N×typeSpeed : texte complet affiché", () => {
    const text = "hello";
    const { result } = renderHook(() =>
      useTypedText({ strings: [text], startDelay: 100, typeSpeed: 50 }),
    );

    act(() => {
      vi.advanceTimersByTime(100 + 50 * text.length);
    });

    expect(result.current.text).toBe(text);
  });
});
