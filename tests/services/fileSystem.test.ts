import { describe, it, expect, beforeEach, vi } from "vitest";
import { readTextFile, writeTextFile, exists } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { convertFileSrc } from "@tauri-apps/api/core";
import { FileSystemService } from "@/services/fileSystem";
import { AppError } from "@/types/errors";

describe("FileSystemService", () => {
  let svc: FileSystemService;

  beforeEach(() => {
    svc = new FileSystemService();
  });

  it("openFile reads content from path", async () => {
    vi.mocked(readTextFile).mockResolvedValue("# Hello World");
    const content = await svc.readFile("/path/to/file.md");
    expect(readTextFile).toHaveBeenCalledWith("/path/to/file.md");
    expect(content).toBe("# Hello World");
  });

  it("openFile throws AppError on failure", async () => {
    vi.mocked(readTextFile).mockRejectedValue(new Error("ENOENT"));
    await expect(svc.readFile("/missing.md")).rejects.toBeInstanceOf(AppError);
  });

  it("saveFile writes content to path", async () => {
    vi.mocked(writeTextFile).mockResolvedValue();
    await svc.writeFile("/path/to/file.md", "# Content");
    expect(writeTextFile).toHaveBeenCalledWith("/path/to/file.md", "# Content");
  });

  it("saveFile throws AppError on failure", async () => {
    vi.mocked(writeTextFile).mockRejectedValue(new Error("EACCES"));
    await expect(svc.writeFile("/no-perm.md", "")).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("showOpenDialog returns path on selection", async () => {
    vi.mocked(open).mockResolvedValue("/chosen/file.md");
    const result = await svc.showOpenDialog();
    expect(result).toBe("/chosen/file.md");
    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.any(Array), multiple: false }),
    );
  });

  it("showOpenDialog returns null on cancel", async () => {
    vi.mocked(open).mockResolvedValue(null);
    const result = await svc.showOpenDialog();
    expect(result).toBeNull();
  });

  it("showSaveDialog returns path on selection", async () => {
    vi.mocked(save).mockResolvedValue("/save/here.md");
    const result = await svc.showSaveDialog("untitled.md");
    expect(result).toBe("/save/here.md");
  });

  it("resolveAssetUrl converts local path to asset URL", () => {
    vi.mocked(convertFileSrc).mockReturnValue("asset://localhost/abs/img.png");
    const url = svc.resolveAssetUrl("/abs/img.png");
    expect(url).toBe("asset://localhost/abs/img.png");
    expect(convertFileSrc).toHaveBeenCalledWith("/abs/img.png");
  });

  it("fileExists delegates to exists()", async () => {
    vi.mocked(exists).mockResolvedValue(true);
    const result = await svc.fileExists("/some/path.png");
    expect(result).toBe(true);
  });
});
