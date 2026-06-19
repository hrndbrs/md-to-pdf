import { ref } from "vue";

export interface AppNotification {
  id: string;
  level: "error" | "warning" | "info";
  message: string;
}

const errors = ref<AppNotification[]>([]);

export function useAppErrors() {
  function addError(
    message: string,
    level: AppNotification["level"] = "error",
  ) {
    errors.value.push({ id: crypto.randomUUID(), level, message });
  }

  function clearError(id: string) {
    errors.value = errors.value.filter((e) => e.id !== id);
  }

  function clearAll() {
    errors.value = [];
  }

  return { errors, addError, clearError, clearAll };
}
