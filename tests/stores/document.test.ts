import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useDocumentStore } from "@/stores/document";

describe("DocumentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("starts with empty untitled document", () => {
    const store = useDocumentStore();
    expect(store.content).toBe("");
    expect(store.filePath).toBeNull();
    expect(store.isDirty).toBe(false);
    expect(store.fileName).toBe("untitled");
  });

  it("setContent marks dirty", () => {
    const store = useDocumentStore();
    store.setContent("# Hello");
    expect(store.content).toBe("# Hello");
    expect(store.isDirty).toBe(true);
  });

  it("openFile sets content and clears dirty", () => {
    const store = useDocumentStore();
    store.setContent("dirty content");
    store.openFile("/home/user/docs/file.md", "# New File");
    expect(store.content).toBe("# New File");
    expect(store.filePath).toBe("/home/user/docs/file.md");
    expect(store.isDirty).toBe(false);
  });

  it("fileName derived from filePath", () => {
    const store = useDocumentStore();
    store.openFile("/home/user/docs/readme.md", "");
    expect(store.fileName).toBe("readme.md");
  });

  it("newDocument resets all state", () => {
    const store = useDocumentStore();
    store.openFile("/path/to/file.md", "# Content");
    store.setContent("changed");
    store.newDocument();
    expect(store.content).toBe("");
    expect(store.filePath).toBeNull();
    expect(store.isDirty).toBe(false);
    expect(store.fileName).toBe("untitled");
  });

  it("markSaved clears dirty flag", () => {
    const store = useDocumentStore();
    store.setContent("# Hello");
    expect(store.isDirty).toBe(true);
    store.markSaved();
    expect(store.isDirty).toBe(false);
  });

  it("markSaved with path updates filePath", () => {
    const store = useDocumentStore();
    store.newDocument();
    store.setContent("content");
    store.markSaved("/new/path/doc.md");
    expect(store.filePath).toBe("/new/path/doc.md");
    expect(store.isDirty).toBe(false);
  });
});
