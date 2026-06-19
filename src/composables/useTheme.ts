import { watch } from "vue";
import { useSettingsStore } from "@/stores/settings";

export function useTheme() {
  const settingsStore = useSettingsStore();

  function applyTheme(theme: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // Automatically apply when theme changes
  watch(() => settingsStore.theme, applyTheme, { immediate: true });

  return { applyTheme };
}
