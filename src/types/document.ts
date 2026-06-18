export interface DocumentContext {
  id: string;
  content: string;
  filePath: string | null;
  fileName: string;
  isDirty: boolean;
}
