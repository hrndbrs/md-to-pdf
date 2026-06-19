import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save, confirm } from "@tauri-apps/plugin-dialog";
import { useDocument } from "@/composables/useDocument";
import { useDocumentStore } from "@/stores/document";

describe("useDocument", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("openFile reads file and updates store", async () => {
    vi.mocked(readTextFile).mockResolvedValue("# Loaded Content");
    vi.mocked(open).mockResolvedValue("/path/to/file.md");

    const { openFile } = useDocument();
    await openFile();

    const store = useDocumentStore();
    expect(store.content).toBe("# Loaded Content");
    expect(store.filePath).toBe("/path/to/file.md");
    expect(store.isDirty).toBe(false);
  });

  it("openFile does nothing when dialog cancelled", async () => {
    vi.mocked(open).mockResolvedValue(null);

    const { openFile } = useDocument();
    await openFile();

    const store = useDocumentStore();
    expect(store.filePath).toBeNull();
  });

  it("save writes to current filePath", async () => {
    vi.mocked(writeTextFile).mockResolvedValue();

    const store = useDocumentStore();
    store.openFile("/existing/file.md", "# Content");
    store.setContent("# Updated");

    const { save } = useDocument();
    await save();

    expect(writeTextFile).toHaveBeenCalledWith(
      "/existing/file.md",
      "# Updated",
    );
    expect(store.isDirty).toBe(false);
  });

  it("save triggers saveAs when no filePath", async () => {
    vi.mocked(save).mockResolvedValue("/new/file.md");
    vi.mocked(writeTextFile).mockResolvedValue();

    const store = useDocumentStore();
    store.setContent("# New document");

    const { save: doSave } = useDocument();
    await doSave();

    expect(store.filePath).toBe("/new/file.md");
  });

  it("canClose returns true when not dirty", async () => {
    const { canClose } = useDocument();
    const result = await canClose();
    expect(result).toBe(true);
  });

  it("canClose asks user when dirty and returns their choice", async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    const store = useDocumentStore();
    store.setContent("changed content");

    const { canClose } = useDocument();
    const result = await canClose();
    expect(result).toBe(false);
    expect(confirm).toHaveBeenCalled();
  });
});
