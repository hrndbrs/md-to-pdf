<script setup lang="ts">
import { usePreviewStore } from "@/stores/preview";

const emit = defineEmits<{ confirm: []; cancel: [] }>();
const previewStore = usePreviewStore();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div
      class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-[420px] flex flex-col gap-4"
    >
      <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Export to PDF
      </h2>

      <div
        v-if="previewStore.brokenImagePaths.length > 0"
        class="text-sm bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded p-3 text-yellow-800 dark:text-yellow-200"
      >
        ⚠ {{ previewStore.brokenImagePaths.length }} image(s) could not be
        found. They will appear as blank spaces in the PDF.
      </div>

      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        A print dialog will open. To save as PDF:
      </p>
      <ul
        class="text-sm text-zinc-600 dark:text-zinc-400 list-disc pl-5 space-y-1"
      >
        <li>
          <strong>macOS:</strong> Click <em>PDF</em> → <em>Save as PDF…</em>
        </li>
        <li>
          <strong>Windows:</strong> Select <em>Microsoft Print to PDF</em>
        </li>
        <li><strong>Linux:</strong> Select <em>Print to File</em></li>
      </ul>

      <div class="flex justify-end gap-3 mt-2">
        <button
          class="px-4 py-2 rounded text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          @click="emit('confirm')"
        >
          Open Print Dialog
        </button>
      </div>
    </div>
  </div>
</template>
