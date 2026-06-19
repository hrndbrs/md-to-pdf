import { describe, it, expect, beforeEach, vi } from "vitest";
import { PDFExportService } from "@/services/pdf";

describe("PDFExportService", () => {
  let svc: PDFExportService;
  let printSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    svc = new PDFExportService();
    printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
  });

  it("export() calls window.print()", async () => {
    await svc.export();
    expect(printSpy).toHaveBeenCalledOnce();
  });

  it("prepareForPrint adds printing class to document root", () => {
    svc.prepareForPrint();
    expect(document.documentElement.classList.contains("printing")).toBe(true);
  });

  it("cleanupAfterPrint removes printing class", () => {
    svc.prepareForPrint();
    svc.cleanupAfterPrint();
    expect(document.documentElement.classList.contains("printing")).toBe(false);
  });
});
