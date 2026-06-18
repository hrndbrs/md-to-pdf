import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePreviewStore } from "@/stores/preview";

describe("PreviewStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initializes empty", () => {
    const store = usePreviewStore();
    expect(store.html).toBe("");
    expect(store.isRendering).toBe(false);
    expect(store.renderError).toBeNull();
    expect(store.brokenImagePaths).toEqual([]);
  });

  it("setHtml updates html and clears error", () => {
    const store = usePreviewStore();
    store.setRenderError("prev error");
    store.setHtml("<p>hello</p>");
    expect(store.html).toBe("<p>hello</p>");
    expect(store.renderError).toBeNull();
  });

  it("addBrokenImage accumulates paths", () => {
    const store = usePreviewStore();
    store.addBrokenImage("./img1.png");
    store.addBrokenImage("./img2.png");
    expect(store.brokenImagePaths).toHaveLength(2);
  });

  it("clearBrokenImages empties the list", () => {
    const store = usePreviewStore();
    store.addBrokenImage("./img.png");
    store.clearBrokenImages();
    expect(store.brokenImagePaths).toHaveLength(0);
  });
});
