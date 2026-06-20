import { defineStore } from "pinia";
import { ref } from "vue";
import { load } from "@tauri-apps/plugin-store";
import { DEFAULT_SETTINGS, type Theme, type PaperSize } from "@/types/settings";

export const useSettingsStore = defineStore("settings", () => {
  const theme = ref<Theme>(DEFAULT_SETTINGS.theme);
  const editorFontSize = ref(DEFAULT_SETTINGS.editorFontSize);
  const defaultPaperSize = ref<PaperSize>(DEFAULT_SETTINGS.defaultPaperSize);
  const vimMode = ref(DEFAULT_SETTINGS.vimMode);
  const formatOnSave = ref(DEFAULT_SETTINGS.formatOnSave);

  function setTheme(value: Theme) {
    theme.value = value;
  }
  function setFontSize(value: number) {
    editorFontSize.value = value;
  }
  function setPaperSize(value: PaperSize) {
    defaultPaperSize.value = value;
  }
  function setVimMode(value: boolean) {
    vimMode.value = value;
  }
  function setFormatOnSave(value: boolean) {
    formatOnSave.value = value;
  }

  async function loadFromPersisted() {
    try {
      const store = await load("settings.json", {
        defaults: {},
        autoSave: true,
      });
      const t = await store.get<Theme>("theme");
      const fs = await store.get<number>("editorFontSize");
      const ps = await store.get<PaperSize>("defaultPaperSize");
      const vm = await store.get<boolean>("vimMode");
      const fos = await store.get<boolean>("formatOnSave");
      if (t) theme.value = t;
      if (fs) editorFontSize.value = fs;
      if (ps) defaultPaperSize.value = ps;
      if (vm !== null && vm !== undefined) vimMode.value = vm;
      if (fos !== null && fos !== undefined) formatOnSave.value = fos;
    } catch {
      // First launch — no stored settings; use defaults
    }
  }

  async function persist() {
    try {
      const store = await load("settings.json", {
        defaults: {},
        autoSave: true,
      });
      await store.set("theme", theme.value);
      await store.set("editorFontSize", editorFontSize.value);
      await store.set("defaultPaperSize", defaultPaperSize.value);
      await store.set("vimMode", vimMode.value);
      await store.set("formatOnSave", formatOnSave.value);
    } catch {
      // Non-fatal — settings not persisted but app continues
    }
  }

  return {
    theme,
    editorFontSize,
    defaultPaperSize,
    vimMode,
    formatOnSave,
    setTheme,
    setFontSize,
    setPaperSize,
    setVimMode,
    setFormatOnSave,
    loadFromPersisted,
    persist,
  };
});
