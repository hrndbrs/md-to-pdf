import { describe, it, expect } from "vitest";
import { AppError, isAppError } from "@/types/errors";
import { DEFAULT_SETTINGS } from "@/types/settings";

describe("types", () => {
  it("AppError is instanceof Error", () => {
    const err = new AppError("UNKNOWN", "test");
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("UNKNOWN");
    expect(err.message).toBe("test");
  });

  it("isAppError narrows type", () => {
    expect(isAppError(new AppError("IO_ERROR", "x"))).toBe(true);
    expect(isAppError(new Error("x"))).toBe(false);
    expect(isAppError("string")).toBe(false);
  });

  it("DEFAULT_SETTINGS has expected shape", () => {
    expect(DEFAULT_SETTINGS.theme).toBe("light");
    expect(DEFAULT_SETTINGS.editorFontSize).toBe(14);
    expect(DEFAULT_SETTINGS.defaultPaperSize).toBe("A4");
  });
});
