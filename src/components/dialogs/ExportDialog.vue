<script setup lang="ts">
import { ref, computed } from "vue";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useDocumentStore } from "@/stores/document";
import { usePreviewStore } from "@/stores/preview";
import { useExport } from "@/composables/useExport";
import {
  PAGE_SIZES,
  MARGINS,
  type PageLayout,
  type PageMargin,
} from "@/types/export";

const emit = defineEmits<{ cancel: [] }>();

const docStore = useDocumentStore();
const previewStore = usePreviewStore();
const { isExporting, exportError, runExport } = useExport();

const outputPath = ref<string>(defaultOutputPath());
const layout = ref<PageLayout>("a4");
const margin = ref<PageMargin>("normal");
const includeToc = ref(true);

function defaultOutputPath(): string {
  if (docStore.filePath) {
    return docStore.filePath.replace(/\.(md|markdown)$/i, ".pdf");
  }
  return "export.pdf";
}

async function browse() {
  const selected = await save({
    defaultPath: outputPath.value,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (selected) outputPath.value = selected;
}

async function handleConfirm() {
  if (!canExport.value || isExporting.value) return;
  await runExport({
    outputPath: outputPath.value,
    layout: layout.value,
    margin: margin.value,
    includeToc: includeToc.value,
  });
  if (!exportError.value) {
    invoke("reveal_in_finder", { path: outputPath.value }).catch(() => {});
    emit("cancel");
  }
}

const canExport = computed(() => outputPath.value.length > 0);
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    @click.self="emit('cancel')"
  >
    <div
      class="bg-surface-container-highest border border-outline-variant rounded-lg w-full max-w-[520px] flex flex-col overflow-hidden shadow-2xl"
    >
      <!-- Header -->
      <div
        class="px-pane-padding py-3 flex items-center justify-between border-b border-outline-variant"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary"
            >picture_as_pdf</span
          >
          <h2 class="text-ui-header font-ui-header text-on-surface">
            Export as PDF
          </h2>
        </div>
        <button
          class="text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close"
          @click="emit('cancel')"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-pane-padding space-y-4">
        <!-- Unsaved changes warning -->
        <div
          v-if="docStore.isDirty"
          class="bg-error-container/20 border border-error/30 p-3 rounded-lg flex gap-3"
        >
          <span
            class="material-symbols-outlined icon-filled text-error shrink-0"
            >warning</span
          >
          <div>
            <p class="text-ui-header font-ui-header text-error mb-1">
              Unsaved Changes
            </p>
            <p class="text-ui-body font-ui-body text-on-surface-variant">
              Your document has unsaved changes. They will not be reflected in
              the PDF unless you save first.
            </p>
          </div>
        </div>

        <!-- Broken images warning -->
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

        <!-- Export Destination -->
        <div class="space-y-2">
          <label
            class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase"
            >Export Destination</label
          >
          <div class="flex gap-gap-normal">
            <div
              class="flex-1 flex items-center px-3 py-2 bg-surface-container-low border border-outline-variant rounded font-editor-main text-ui-body text-on-surface overflow-hidden"
            >
              <span class="truncate">{{
                outputPath || "No destination selected"
              }}</span>
            </div>
            <button
              class="px-3 bg-secondary-container text-on-secondary-container hover:bg-outline-variant transition-colors rounded text-ui-body font-ui-body border border-outline-variant"
              @click="browse"
            >
              Browse
            </button>
          </div>
        </div>

        <!-- Page Layout + Margins -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase"
              >Page Layout</label
            >
            <select
              v-model="layout"
              class="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-ui-body font-ui-body text-on-surface outline-none focus:border-primary"
            >
              <option v-for="(cfg, key) in PAGE_SIZES" :key="key" :value="key">
                {{ cfg.label }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label
              class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase"
              >Margins</label
            >
            <select
              v-model="margin"
              class="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-ui-body font-ui-body text-on-surface outline-none focus:border-primary"
            >
              <option v-for="(cfg, key) in MARGINS" :key="key" :value="key">
                {{ cfg.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- TOC -->
        <div class="flex items-center gap-3 py-2">
          <input
            id="toc-checkbox"
            v-model="includeToc"
            type="checkbox"
            class="w-4 h-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary"
          />
          <label
            for="toc-checkbox"
            class="text-ui-body font-ui-body text-on-surface cursor-pointer"
            >Include Table of Contents</label
          >
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-pane-padding py-4 bg-surface-container-high border-t border-outline-variant flex justify-end gap-3"
      >
        <button
          class="px-4 py-2 text-on-surface-variant hover:text-on-surface text-ui-header font-ui-header transition-colors"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          :disabled="!canExport || isExporting"
          class="px-6 py-2 bg-primary text-on-primary rounded text-ui-header font-ui-header hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleConfirm"
        >
          <template v-if="isExporting">
            <span class="material-symbols-outlined text-[16px] animate-spin">
              progress_activity
            </span>
            <span>Generating</span>
          </template>

          <template v-else>
            <span>Generate PDF</span>
            <span class="material-symbols-outlined text-[16px]"
              >chevron_right</span
            >
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
