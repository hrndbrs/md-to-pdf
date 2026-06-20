<script setup lang="ts">
import { useDocumentStore } from "@/stores/document";

const props = defineProps<{
  line?: number;
  column?: number;
  vimMode?: string;
}>();

const docStore = useDocumentStore();
</script>

<template>
  <footer
    class="status-bar h-statusbar-height flex items-center justify-between px-pane-padding border-t border-outline-variant bg-surface-container-low text-status-text font-status-text text-on-surface-variant select-none shrink-0"
  >
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <span
          v-if="docStore.isDirty"
          class="w-2 h-2 rounded-full bg-orange-500 shrink-0"
          aria-label="Unsaved changes"
        />
        <span v-else class="material-symbols-outlined text-3!"
          >description</span
        >
        <span>{{ docStore.fileName ?? "No active file" }}</span>
        <span v-if="docStore.isDirty" class="opacity-70">— unsaved</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <span v-if="props.vimMode" class="font-mono font-bold tracking-wider">{{
        props.vimMode
      }}</span>
      <span>Markdown-it</span>
      <span>UTF-8</span>
      <span v-if="props.line"
        >Ln {{ props.line }}, Col {{ props.column ?? 1 }}</span
      >
    </div>
  </footer>
</template>
