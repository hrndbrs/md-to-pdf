import { defineStore } from "pinia";
import { ref } from "vue";
import { load } from "@tauri-apps/plugin-store";
import { DEFAULT_SETTINGS, type Theme, type PaperSize } from "@/types/settings";

export const useSettingsStore = defineStore("settings", () => {
  const theme = ref<Theme>(DEFAULT_SETTINGS.theme);
  const editorFontSize = ref(DEFAULT_SETTINGS.editorFontSize);
  const defaultPaperSize = ref<PaperSize>(DEFAULT_SETTINGS.defaultPaperSize);

  function setTheme(value: Theme) {
    theme.value = value;
  }

  function setFontSize(value: number) {
    editorFontSize.value = value;
  }

  function setPaperSize(value: PaperSize) {
    defaultPaperSize.value = value;
  }

  async function loadFromPersisted() {
    try {
      const store = await load("settings.json", { autoSave: true });
      const t = await store.get<Theme>("theme");
      const fs = await store.get<number>("editorFontSize");
      const ps = await store.get<PaperSize>("defaultPaperSize");
      if (t) theme.value = t;
      if (fs) editorFontSize.value = fs;
      if (ps) defaultPaperSize.value = ps;
    } catch {
      // First launch — no stored settings; use defaults
    }
  }

  async function persist() {
    try {
      const store = await load("settings.json", { autoSave: true });
      await store.set("theme", theme.value);
      await store.set("editorFontSize", editorFontSize.value);
      await store.set("defaultPaperSize", defaultPaperSize.value);
    } catch {
      // Non-fatal — settings not persisted but app continues
    }
  }

  return {
    theme,
    editorFontSize,
    defaultPaperSize,
    setTheme,
    setFontSize,
    setPaperSize,
    loadFromPersisted,
    persist,
  };
});
