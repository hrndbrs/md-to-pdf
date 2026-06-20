<script setup lang="ts">
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center h-full gap-6 select-none p-12 text-center bg-surface-container"
  >
    <div class="relative">
      <div
        class="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-12! text-primary"
          >markdown</span
        >
      </div>
      <div
        class="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-5!">picture_as_pdf</span>
      </div>
    </div>

    <div>
      <h2
        class="text-ui-header font-ui-header font-semibold text-on-surface text-xl mb-1"
      >
        MD to PDF
      </h2>
      <p class="text-ui-body font-ui-body text-on-surface-variant">
        Drop a .md file here, or
      </p>
    </div>

    <div class="flex flex-col items-center gap-4">
      <button
        class="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary text-ui-header font-ui-header rounded-lg hover:brightness-110 transition-all"
        @click="emit('open')"
      >
        <span class="material-symbols-outlined text-5!">upload_file</span>
        Open File
      </button>
    </div>
  </div>
</template>
