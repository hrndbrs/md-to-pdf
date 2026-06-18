import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useDocumentStore = defineStore("document", () => {
  const id = ref(crypto.randomUUID());
  const content = ref("");
  const filePath = ref<string | null>(null);
  const isDirty = ref(false);

  const fileName = computed(() => {
    if (!filePath.value) return "untitled";
    return filePath.value.replace(/\\/g, "/").split("/").pop() ?? "untitled";
  });

  function setContent(value: string) {
    content.value = value;
    isDirty.value = true;
  }

  function openFile(path: string, fileContent: string) {
    id.value = crypto.randomUUID();
    filePath.value = path;
    content.value = fileContent;
    isDirty.value = false;
  }

  function newDocument() {
    id.value = crypto.randomUUID();
    content.value = "";
    filePath.value = null;
    isDirty.value = false;
  }

  function markSaved(newPath?: string) {
    if (newPath !== undefined) filePath.value = newPath;
    isDirty.value = false;
  }

  return {
    id,
    content,
    filePath,
    isDirty,
    fileName,
    setContent,
    openFile,
    newDocument,
    markSaved,
  };
});
