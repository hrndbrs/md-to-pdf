export type Theme = "light" | "dark";
export type PaperSize = "A4" | "Letter";

export interface AppSettings {
  theme: Theme;
  editorFontSize: number;
  defaultPaperSize: PaperSize;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  editorFontSize: 14,
  defaultPaperSize: "A4",
};
