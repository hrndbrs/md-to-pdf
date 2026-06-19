import { ref } from "vue";
import { pdfExportService } from "@/services/pdf";
import { usePreviewStore } from "@/stores/preview";
import { useAppErrors } from "@/composables/useAppErrors";
import type { ExportOptions } from "@/types/export";

export function useExport() {
  const isExporting = ref(false);
  const exportError = ref<string | null>(null);
  const previewStore = usePreviewStore();
  const { addError } = useAppErrors();

  async function runExport(options: ExportOptions) {
    if (!previewStore.html) {
      addError("Nothing to export — open a markdown file first.");
      return;
    }
    isExporting.value = true;
    exportError.value = null;
    try {
      await pdfExportService.export(previewStore.html, options);
    } catch (err) {
      console.error("[PDF Export] failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      exportError.value = msg;
      addError(msg);
    } finally {
      isExporting.value = false;
    }
  }

  return { isExporting, exportError, runExport };
}
