<script setup lang="ts">
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center h-full gap-6 text-zinc-400 dark:text-zinc-600 select-none"
  >
    <div class="text-center">
      <p class="text-2xl font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
        md-to-pdf
      </p>
      <p class="text-sm">Drop a .md file here, or</p>
    </div>
    <button
      class="px-4 py-2 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium"
      @click="emit('open')"
    >
      Open File…
    </button>
    <p class="text-xs">
      New document?
      <button class="underline" @click="emit('open')">Start writing</button>
    </p>
  </div>
</template>
