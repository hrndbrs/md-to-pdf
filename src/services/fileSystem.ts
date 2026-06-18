import { readTextFile, writeTextFile, exists } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import { AppError } from "@/types/errors";

export class FileSystemService {
  async readFile(path: string): Promise<string> {
    try {
      return await readTextFile(path);
    } catch (err) {
      throw new AppError("IO_ERROR", `Failed to read file: ${path}`, err);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await writeTextFile(path, content);
    } catch (err) {
      throw new AppError("IO_ERROR", `Failed to write file: ${path}`, err);
    }
  }

  async showOpenDialog(): Promise<string | null> {
    const result = await open({
      filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      multiple: false,
    });
    if (Array.isArray(result)) return result[0] ?? null;
    return result;
  }

  async showSaveDialog(defaultName = "untitled.md"): Promise<string | null> {
    return save({
      filters: [{ name: "Markdown", extensions: ["md"] }],
      defaultPath: defaultName,
    });
  }

  resolveAssetUrl(absolutePath: string): string {
    return convertFileSrc(absolutePath);
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      return await exists(path);
    } catch {
      return false;
    }
  }
}

export const fileSystemService = new FileSystemService();
