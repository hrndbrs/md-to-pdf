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
        <span class="material-symbols-outlined !text-[48px] text-primary"
          >markdown</span
        >
      </div>
      <div
        class="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center"
      >
        <span class="material-symbols-outlined !text-[20px]"
          >picture_as_pdf</span
        >
      </div>
    </div>

    <div>
      <h2
        class="text-ui-header font-ui-header font-semibold text-on-surface text-xl mb-1"
      >
        md-to-pdf
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
        <span class="material-symbols-outlined !text-[20px]">upload_file</span>
        Open File…
      </button>
      <button
        class="flex items-center gap-1 text-primary text-ui-body font-ui-body hover:underline"
        @click="emit('open')"
      >
        <span class="material-symbols-outlined !text-[18px]">add_circle</span>
        New document?
      </button>
    </div>
  </div>
</template>
