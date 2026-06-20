export type PageLayout = "a4" | "letter" | "legal";
export type PageMargin = "normal" | "compact" | "none";

export interface ExportOptions {
  outputPath: string;
  layout: PageLayout;
  margin: PageMargin;
  includeToc: boolean;
}

export const PAGE_SIZES: Record<
  PageLayout,
  { label: string; width: number; height: number; jsPdfFormat: string }
> = {
  a4: {
    label: "A4 (210 × 297mm)",
    width: 794,
    height: 1123,
    jsPdfFormat: "a4",
  },
  letter: {
    label: "US Letter",
    width: 816,
    height: 1056,
    jsPdfFormat: "letter",
  },
  legal: { label: "Legal", width: 816, height: 1344, jsPdfFormat: "legal" },
};

export const MARGINS: Record<PageMargin, { label: string; px: number }> = {
  normal: { label: "Normal (1 inch)", px: 96 },
  compact: { label: "Compact (0.5 inch)", px: 48 },
  none: { label: "None", px: 0 },
};
