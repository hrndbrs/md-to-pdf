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
  <div
    class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div
        class="h-toolbar-height flex items-center px-pane-padding border-b border-outline-variant bg-surface-container-low"
      >
        <h1 class="text-ui-header font-ui-header text-on-surface flex-1">
          Settings
        </h1>
      </div>

      <!-- Content -->
      <div class="p-pane-padding space-y-6">
        <!-- Appearance -->
        <section class="space-y-2">
          <label
            class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase block"
          >
            Appearance
          </label>
          <div class="flex p-1 bg-surface-container-high rounded-lg gap-1">
            <button
              v-for="t in ['light', 'dark'] as Theme[]"
              :key="t"
              class="flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-ui-body font-ui-body font-medium transition-all"
              :class="
                store.theme === t
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              "
              @click="onTheme(t)"
            >
              <span class="material-symbols-outlined !text-[18px]">
                {{ t === "light" ? "light_mode" : "dark_mode" }}
              </span>
              {{ t.charAt(0).toUpperCase() + t.slice(1) }}
            </button>
          </div>
        </section>

        <!-- Font size -->
        <section class="space-y-2">
          <label
            class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase block"
            for="editor-font-size"
          >
            Editor font size
          </label>
          <input
            id="editor-font-size"
            type="number"
            min="10"
            max="32"
            :value="store.editorFontSize"
            class="w-full h-10 px-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-editor-main text-editor-main text-on-surface transition-all"
            @change="onFontSize"
          />
        </section>

        <!-- Paper size -->
        <section class="space-y-2">
          <label
            class="text-ui-label-sm font-ui-label-sm text-on-surface-variant uppercase block"
          >
            Default paper size
          </label>
          <p
            class="text-ui-label-sm font-ui-label-sm text-on-surface-variant opacity-70 italic"
          >
            Informational only — actual size is set in the OS print dialog.
          </p>
          <div class="flex p-1 bg-surface-container-high rounded-lg gap-1">
            <button
              v-for="ps in ['A4', 'Letter'] as PaperSize[]"
              :key="ps"
              class="flex-1 py-1.5 rounded text-ui-body font-ui-body font-medium transition-all"
              :class="
                store.defaultPaperSize === ps
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              "
              @click="onPaperSize(ps)"
            >
              {{ ps }}
            </button>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div
        class="px-pane-padding py-3 bg-surface-container-low border-t border-outline-variant flex justify-end"
      >
        <button
          class="px-5 py-2 text-ui-header font-ui-header text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
