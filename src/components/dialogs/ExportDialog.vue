<script setup lang="ts">
import { usePreviewStore } from "@/stores/preview";

const emit = defineEmits<{ confirm: []; cancel: [] }>();
const previewStore = usePreviewStore();
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    @click.self="emit('cancel')"
  >
    <div
      class="bg-surface-container-lowest border border-outline-variant rounded-lg w-full max-w-105 flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div
        class="px-pane-padding py-3 border-b border-outline-variant flex items-center justify-between"
      >
        <h3 class="text-ui-header font-ui-header text-on-surface">
          Export to PDF
        </h3>
        <button
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-highest transition-colors text-on-surface-variant"
          aria-label="Close"
          @click="emit('cancel')"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="p-pane-padding space-y-4">
        <div
          v-if="previewStore.brokenImagePaths.length > 0"
          class="bg-tertiary-container text-on-tertiary-container rounded p-3 flex gap-3"
        >
          <span
            class="material-symbols-outlined icon-filled text-tertiary shrink-0"
            >warning</span
          >
          <p class="text-ui-body font-ui-body">
            {{ previewStore.brokenImagePaths.length }} image(s) could not be
            found. They will be missing in the PDF.
          </p>
        </div>

        <div>
          <h4
            class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase mb-2"
          >
            Printing Instructions
          </h4>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 w-6 h-6 shrink-0 bg-surface-container-high rounded flex items-center justify-center"
              >
                <span
                  class="material-symbols-outlined text-3.5! text-on-surface-variant"
                  >terminal</span
                >
              </div>
              <div>
                <p
                  class="font-semibold text-on-surface text-ui-body font-ui-body"
                >
                  macOS
                </p>
                <p class="text-ui-body font-ui-body text-on-surface-variant">
                  Press
                  <kbd
                    class="px-1 bg-surface-container-high rounded font-editor-main"
                    >⌘ P</kbd
                  >, select "Save as PDF" in the destination.
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 w-6 h-6 shrink-0 bg-surface-container-high rounded flex items-center justify-center"
              >
                <span
                  class="material-symbols-outlined text-3.5! text-on-surface-variant"
                  >window</span
                >
              </div>
              <div>
                <p
                  class="font-semibold text-on-surface text-ui-body font-ui-body"
                >
                  Windows
                </p>
                <p class="text-ui-body font-ui-body text-on-surface-variant">
                  Press
                  <kbd
                    class="px-1 bg-surface-container-high rounded font-editor-main"
                    >Ctrl P</kbd
                  >, choose "Microsoft Print to PDF".
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 w-6 h-6 shrink-0 bg-surface-container-high rounded flex items-center justify-center"
              >
                <span
                  class="material-symbols-outlined text-3.5! text-on-surface-variant"
                  >grid_view</span
                >
              </div>
              <div>
                <p
                  class="font-semibold text-on-surface text-ui-body font-ui-body"
                >
                  Linux
                </p>
                <p class="text-ui-body font-ui-body text-on-surface-variant">
                  Press
                  <kbd
                    class="px-1 bg-surface-container-high rounded font-editor-main"
                    >Ctrl P</kbd
                  >, select "Print to File" with PDF output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-pane-padding py-3 bg-surface-container-low border-t border-outline-variant flex justify-end gap-2"
      >
        <button
          class="px-4 py-1.5 text-ui-header font-ui-header text-on-surface-variant hover:text-on-surface transition-colors"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-1.5 bg-primary text-on-primary text-ui-header font-ui-header rounded hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          @click="emit('confirm')"
        >
          Open Print Dialog
        </button>
      </div>
    </div>
  </div>
</template>
