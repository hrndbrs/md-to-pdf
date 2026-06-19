<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useSettingsStore } from "@/stores/settings";
import type { Theme, PaperSize } from "@/types/settings";

const emit = defineEmits<{ close: [] }>();
const store = useSettingsStore();

function onTheme(t: Theme) {
  store.setTheme(t);
  store.persist();
}

function onFontSize(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  if (val >= 10 && val <= 32) {
    store.setFontSize(val);
    store.persist();
  }
}

function onPaperSize(ps: PaperSize) {
  store.setPaperSize(ps);
  store.persist();
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

onMounted(() => window.addEventListener("keydown", onKeyDown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown));
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div
      class="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-96 flex flex-col gap-5"
    >
      <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Settings
      </h2>

      <!-- Theme -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >Appearance</label
        >
        <div class="flex gap-2">
          <button
            v-for="t in ['light', 'dark'] as Theme[]"
            :key="t"
            class="flex-1 py-1.5 rounded text-sm font-medium border"
            :class="
              store.theme === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            "
            @click="onTheme(t)"
          >
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
        </div>
      </div>

      <!-- Font size -->
      <div class="flex items-center gap-3">
        <label for="editor-font-size" class="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28"
          >Editor font size</label
        >
        <input
          id="editor-font-size"
          type="number"
          min="10"
          max="32"
          :value="store.editorFontSize"
          class="w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
          @change="onFontSize"
        />
        <span class="text-sm text-zinc-500">px</span>
      </div>

      <!-- Paper size -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >Default paper size</label
        >
        <p class="text-xs text-zinc-400 dark:text-zinc-500 -mt-1">
          Informational in V1 — actual size is set in the OS print dialog.
        </p>
        <div class="flex gap-2">
          <button
            v-for="ps in ['A4', 'Letter'] as PaperSize[]"
            :key="ps"
            class="flex-1 py-1.5 rounded text-sm font-medium border"
            :class="
              store.defaultPaperSize === ps
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            "
            @click="onPaperSize(ps)"
          >
            {{ ps }}
          </button>
        </div>
      </div>

      <div class="flex justify-end mt-2">
        <button
          class="px-4 py-2 rounded text-sm font-medium bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
