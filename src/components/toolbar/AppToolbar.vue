<script setup lang="ts">
import { useDocumentStore } from "@/stores/document";
import { useSettingsStore } from "@/stores/settings";

const emit = defineEmits<{
  new: [];
  open: [];
  save: [];
  saveAs: [];
  export: [];
  settings: [];
}>();

const docStore = useDocumentStore();
const settingsStore = useSettingsStore();

function toggleTheme() {
  settingsStore.setTheme(settingsStore.theme === "light" ? "dark" : "light");
  settingsStore.persist();
}
</script>

<template>
  <header
    class="app-toolbar h-toolbar-height flex items-center justify-between px-pane-padding border-b border-outline-variant bg-surface-container-low select-none shrink-0"
  >
    <div class="flex items-center gap-4">
      <span class="text-ui-header font-ui-header font-bold text-on-surface"
        >md-to-pdf</span
      >
      <div class="h-4 w-px bg-outline-variant" />
      <div class="flex items-center gap-0.5">
        <button class="toolbar-icon-btn" title="New (⌘N)" @click="emit('new')">
          <span class="material-symbols-outlined">add</span>
        </button>
        <button
          class="toolbar-icon-btn"
          title="Open (⌘O)"
          @click="emit('open')"
        >
          <span class="material-symbols-outlined">folder_open</span>
        </button>
        <button
          class="toolbar-icon-btn"
          title="Save (⌘S)"
          @click="emit('save')"
        >
          <span class="material-symbols-outlined">save</span>
        </button>
        <button
          class="toolbar-icon-btn"
          title="Save As (⌘⇧S)"
          @click="emit('saveAs')"
        >
          <span class="material-symbols-outlined">save_as</span>
        </button>
      </div>
    </div>

    <div class="flex items-center gap-gap-normal">
      <button
        class="flex items-center gap-2 px-3 h-7 bg-primary text-on-primary rounded text-ui-header font-ui-header hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        title="Export PDF (⌘P)"
        :disabled="!docStore.content"
        @click="emit('export')"
      >
        <span class="material-symbols-outlined !text-[16px]"
          >picture_as_pdf</span
        >
        <span>Export PDF</span>
      </button>
      <div class="h-4 w-px bg-outline-variant" />
      <button
        class="toolbar-icon-btn"
        title="Settings"
        @click="emit('settings')"
      >
        <span class="material-symbols-outlined">settings</span>
      </button>
      <button
        class="toolbar-icon-btn"
        :title="`Switch to ${settingsStore.theme === 'light' ? 'dark' : 'light'} theme`"
        @click="toggleTheme"
      >
        <span class="material-symbols-outlined">
          {{ settingsStore.theme === "light" ? "dark_mode" : "light_mode" }}
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.toolbar-icon-btn {
  @apply w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer;
}
</style>
