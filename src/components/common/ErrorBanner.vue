<script setup lang="ts">
import { useAppErrors } from "@/composables/useAppErrors";

const { errors, clearError } = useAppErrors();
</script>

<template>
  <div class="fixed top-0 left-0 right-0 z-50 flex flex-col gap-1 p-2">
    <div
      v-for="err in errors"
      :key="err.id"
      class="flex items-center justify-between px-4 py-2 rounded text-ui-body font-ui-body"
      :class="{
        'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim':
          err.level === 'warning',
        'bg-error-container text-on-error-container': err.level === 'error',
        'bg-primary-fixed text-on-primary-fixed': err.level === 'info',
      }"
    >
      <span>{{ err.message }}</span>
      <button
        class="ml-4 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
        @click="clearError(err.id)"
      >
        <span class="material-symbols-outlined !text-[16px]">close</span>
      </button>
    </div>
  </div>
</template>
