<script setup lang="ts">
import { useAppErrors } from "@/composables/useAppErrors";

const { errors, clearError } = useAppErrors();
</script>

<template>
  <div class="error-banners fixed top-0 left-0 right-0 z-50 flex flex-col gap-1 p-2">
    <div
      v-for="err in errors"
      :key="err.id"
      class="flex items-center justify-between px-4 py-2 rounded text-ui-body font-ui-body"
      :class="{
        'bg-tertiary-container text-on-tertiary-container':
          err.level === 'warning',
        'bg-error-container text-on-error-container': err.level === 'error',
        'bg-primary-container text-on-primary-container': err.level === 'info',
      }"
    >
      <span>{{ err.message }}</span>
      <button
        class="ml-4 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
        @click="clearError(err.id)"
      >
        <span class="material-symbols-outlined text-4!">close</span>
      </button>
    </div>
  </div>
</template>
