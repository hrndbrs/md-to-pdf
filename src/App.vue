<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppToolbar from "@/components/toolbar/AppToolbar.vue";
import StatusBar from "@/components/common/StatusBar.vue";
import ErrorBanner from "@/components/common/ErrorBanner.vue";
import EditorPane from "@/components/editor/EditorPane.vue";
import PreviewPane from "@/components/preview/PreviewPane.vue";
import { useSettingsStore } from "@/stores/settings";
import { useDocument } from "@/composables/useDocument";
import { useTheme } from "@/composables/useTheme";
import { useKeyboard } from "@/composables/useKeyboard";

const settingsStore = useSettingsStore();
const { openFile, newDocument, save, saveAs, openPath } = useDocument();
const showSettings = ref(false);
const showExport = ref(false);
const cursorLine = ref(1);
const cursorCol = ref(1);

useTheme();
useKeyboard({
  onNew: newDocument,
  onOpen: openFile,
  onSave: save,
  onSaveAs: saveAs,
  onExport: () => {
    showExport.value = true;
  },
});

onMounted(async () => {
  await settingsStore.loadFromPersisted();
});
</script>

<template>
  <div
    class="app-shell h-screen flex flex-col overflow-hidden"
    :data-theme="settingsStore.theme"
    :class="{ dark: settingsStore.theme === 'dark' }"
  >
    <ErrorBanner />
    <AppToolbar
      @new="newDocument"
      @open="openFile"
      @save="save"
      @save-as="saveAs"
      @export="showExport = true"
      @settings="showSettings = true"
    />
    <div class="flex-1 flex overflow-hidden">
      <!-- Editor and Preview panels — wired in Tasks 13 & 16 -->
      <EditorPane
        class="flex-1 overflow-hidden"
        @cursor-change="
          (l, c) => {
            cursorLine = l;
            cursorCol = c;
          }
        "
      />
      <div class="w-px bg-zinc-200 dark:bg-zinc-700" />
      <PreviewPane
        class="flex-1 overflow-hidden"
        @request-open="(path?: string) => path ? openPath(path) : openFile()"
      />
    </div>
    <StatusBar :line="cursorLine" :column="cursorCol" />
  </div>
</template>
