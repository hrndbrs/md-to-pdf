import { defineStore } from "pinia";
import { ref } from "vue";

export const usePreviewStore = defineStore("preview", () => {
  const html = ref("");
  const isRendering = ref(false);
  const renderError = ref<string | null>(null);
  const brokenImagePaths = ref<string[]>([]);

  function setHtml(value: string) {
    html.value = value;
    renderError.value = null;
  }

  function setRenderError(error: string) {
    renderError.value = error;
  }

  function setRendering(value: boolean) {
    isRendering.value = value;
  }

  function addBrokenImage(path: string) {
    brokenImagePaths.value.push(path);
  }

  function clearBrokenImages() {
    brokenImagePaths.value = [];
  }

  return {
    html,
    isRendering,
    renderError,
    brokenImagePaths,
    setHtml,
    setRenderError,
    setRendering,
    addBrokenImage,
    clearBrokenImages,
  };
});
