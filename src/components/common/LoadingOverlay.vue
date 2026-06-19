<script setup lang="ts">
defineProps<{ message?: string }>();
</script>

<template>
  <div
    class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm gap-3"
  >
    <svg
      class="animate-spin h-6 w-6 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <p v-if="message" class="text-sm text-zinc-600 dark:text-zinc-400">
      {{ message }}
    </p>
  </div>
</template>
