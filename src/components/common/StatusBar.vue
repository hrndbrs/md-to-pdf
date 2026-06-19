<script setup lang="ts">
import { useDocumentStore } from "@/stores/document";

const props = defineProps<{
  line?: number;
  column?: number;
}>();

const docStore = useDocumentStore();
</script>

<template>
  <div
    class="status-bar h-6 flex items-center gap-4 px-3 text-xs border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 select-none shrink-0"
  >
    <span>
      <span v-if="docStore.isDirty" class="text-orange-500 mr-1">●</span>
      {{ docStore.fileName }}
      <span v-if="docStore.isDirty"> — unsaved changes</span>
    </span>
    <div class="flex-1" />
    <span v-if="props.line"
      >Ln {{ props.line }}, Col {{ props.column ?? 1 }}</span
    >
  </div>
</template>
