<script setup lang="ts">
import { useAppErrors } from "@/composables/useAppErrors";

const { errors, clearError } = useAppErrors();
</script>

<template>
  <div
    class="error-banners fixed top-0 left-0 right-0 z-50 flex flex-col gap-1 p-2"
  >
    <div
      v-for="err in errors"
      :key="err.id"
      class="flex items-center justify-between px-4 py-2 rounded text-sm font-medium"
      :class="{
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
          err.level === 'error',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
          err.level === 'warning',
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
          err.level === 'info',
      }"
    >
      <span>{{ err.message }}</span>
      <button
        class="ml-4 text-current opacity-60 hover:opacity-100"
        @click="clearError(err.id)"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  </div>
</template>
