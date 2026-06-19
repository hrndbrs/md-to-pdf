import { AppError } from "@/types/errors";

export class PDFExportService {
  prepareForPrint(): void {
    document.documentElement.classList.add("printing");
  }

  cleanupAfterPrint(): void {
    document.documentElement.classList.remove("printing");
  }

  async export(): Promise<void> {
    this.prepareForPrint();

    return new Promise<void>((resolve, reject) => {
      // Detect when print dialog closes
      const mediaQuery = window.matchMedia("print");
      const handler = (e: MediaQueryListEvent) => {
        if (!e.matches) {
          mediaQuery.removeEventListener("change", handler);
          this.cleanupAfterPrint();
          resolve();
        }
      };
      mediaQuery.addEventListener("change", handler);

      try {
        window.print();
      } catch (err) {
        mediaQuery.removeEventListener("change", handler);
        this.cleanupAfterPrint();
        reject(
          new AppError(
            "PRINT_FAILED",
            `Print failed: ${err instanceof Error ? err.message : String(err)}`,
            err,
          ),
        );
      }

      // Fallback: if matchMedia never fires (some environments), clean up after delay
      setTimeout(() => {
        mediaQuery.removeEventListener("change", handler);
        this.cleanupAfterPrint();
        resolve();
      }, 60_000);
    });
  }
}

export const pdfExportService = new PDFExportService();
