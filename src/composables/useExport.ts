import { ref } from "vue";
import { pdfExportService } from "@/services/pdf";
import { usePreviewStore } from "@/stores/preview";
import { useAppErrors } from "@/composables/useAppErrors";

export function useExport() {
  const isExporting = ref(false);
  const exportError = ref<string | null>(null);
  const previewStore = usePreviewStore();
  const { addError } = useAppErrors();

  async function runExport() {
    isExporting.value = true;
    exportError.value = null;
    try {
      await pdfExportService.export();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      exportError.value = msg;
      addError(msg);
    } finally {
      isExporting.value = false;
    }
  }

  return {
    isExporting,
    exportError,
    hasBrokenImages: () => previewStore.brokenImagePaths.length > 0,
    runExport,
  };
}
