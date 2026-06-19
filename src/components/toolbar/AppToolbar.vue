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
  <div
    class="app-toolbar h-10 flex items-center gap-1 px-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 select-none shrink-0"
  >
    <!-- Left: file actions -->
    <button class="toolbar-btn" title="New (⌘N)" @click="emit('new')">🗋</button>
    <button class="toolbar-btn" title="Open (⌘O)" @click="emit('open')">
      📂
    </button>
    <button class="toolbar-btn" title="Save (⌘S)" @click="emit('save')">
      💾
    </button>
    <button class="toolbar-btn" title="Save As (⌘⇧S)" @click="emit('saveAs')">
      ⌄
    </button>

    <div class="flex-1" />

    <!-- Right: export, settings, theme -->
    <button
      class="toolbar-btn px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-40"
      title="Export PDF (⌘P)"
      :disabled="!docStore.content"
      @click="emit('export')"
    >
      ▶ Export PDF
    </button>
    <button class="toolbar-btn" title="Settings" @click="emit('settings')">
      ⚙
    </button>
    <button
      class="toolbar-btn"
      :title="`Switch to ${settingsStore.theme === 'light' ? 'dark' : 'light'} theme`"
      @click="toggleTheme"
    >
      {{ settingsStore.theme === "light" ? "🌙" : "☀" }}
    </button>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.toolbar-btn {
  @apply p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-sm;
}
</style>
