import { onMounted, onBeforeUnmount } from "vue";

interface KeyboardHandlers {
  onSave?: () => void;
  onSaveAs?: () => void;
  onOpen?: () => void;
  onNew?: () => void;
  onExport?: () => void;
}

export function useKeyboard(handlers: KeyboardHandlers) {
  function onKeyDown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === "s" && e.shiftKey) {
      e.preventDefault();
      handlers.onSaveAs?.();
    } else if (e.key === "s") {
      e.preventDefault();
      handlers.onSave?.();
    } else if (e.key === "o") {
      e.preventDefault();
      handlers.onOpen?.();
    } else if (e.key === "n") {
      e.preventDefault();
      handlers.onNew?.();
    } else if (e.key === "p") {
      e.preventDefault();
      handlers.onExport?.();
    }
  }

  onMounted(() => window.addEventListener("keydown", onKeyDown));
  onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown));
}
