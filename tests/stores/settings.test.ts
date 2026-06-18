import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { load } from "@tauri-apps/plugin-store";
import { useSettingsStore } from "@/stores/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

describe("SettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("initializes with default settings", () => {
    const store = useSettingsStore();
    expect(store.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(store.editorFontSize).toBe(DEFAULT_SETTINGS.editorFontSize);
    expect(store.defaultPaperSize).toBe(DEFAULT_SETTINGS.defaultPaperSize);
  });

  it("setTheme updates theme", () => {
    const store = useSettingsStore();
    store.setTheme("dark");
    expect(store.theme).toBe("dark");
  });

  it("setFontSize updates font size", () => {
    const store = useSettingsStore();
    store.setFontSize(18);
    expect(store.editorFontSize).toBe(18);
  });

  it("loadFromPersisted applies stored values", async () => {
    const mockStore = {
      get: vi.fn().mockImplementation(async (key: string) => {
        if (key === "theme") return "dark";
        if (key === "editorFontSize") return 16;
        if (key === "defaultPaperSize") return "Letter";
        return null;
      }),
      set: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(load).mockResolvedValue(mockStore as never);

    const store = useSettingsStore();
    await store.loadFromPersisted();

    expect(store.theme).toBe("dark");
    expect(store.editorFontSize).toBe(16);
    expect(store.defaultPaperSize).toBe("Letter");
  });

  it("loadFromPersisted keeps defaults for missing keys", async () => {
    const mockStore = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(load).mockResolvedValue(mockStore as never);

    const store = useSettingsStore();
    await store.loadFromPersisted();

    expect(store.theme).toBe("light");
  });
});
