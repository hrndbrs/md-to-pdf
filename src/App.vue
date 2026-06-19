<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import AppToolbar from "@/components/toolbar/AppToolbar.vue";
import StatusBar from "@/components/common/StatusBar.vue";
import ErrorBanner from "@/components/common/ErrorBanner.vue";
import EditorPane from "@/components/editor/EditorPane.vue";
import PreviewPane from "@/components/preview/PreviewPane.vue";
import ExportDialog from "@/components/dialogs/ExportDialog.vue";
import SettingsDialog from "@/components/dialogs/SettingsDialog.vue";
import { useSettingsStore } from "@/stores/settings";
import { usePreviewStore } from "@/stores/preview";
import { useDocument } from "@/composables/useDocument";
import { useTheme } from "@/composables/useTheme";
import { useKeyboard } from "@/composables/useKeyboard";
import { useExport } from "@/composables/useExport";
import { useAppErrors } from "@/composables/useAppErrors";

const settingsStore = useSettingsStore();
const previewStore = usePreviewStore();
const { addError, clearAll } = useAppErrors();
const { openFile, newDocument, save, saveAs, openPath, canClose } =
  useDocument();
const { runExport } = useExport();

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

watch(
  () => previewStore.brokenImagePaths,
  (paths) => {
    clearAll();
    if (paths.length > 0) {
      addError(
        `${paths.length} image(s) could not be found. Check that image paths are correct relative to the document.`,
        "warning",
      );
    }
  },
);

onMounted(async () => {
  await settingsStore.loadFromPersisted();
  const win = getCurrentWebviewWindow();
  await win.onCloseRequested(async (event) => {
    const ok = await canClose();
    if (!ok) event.preventDefault();
  });
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
    <div class="flex-1 flex overflow-hidden relative">
      <EditorPane
        class="flex-1 overflow-hidden"
        @cursor-change="
          (l, c) => {
            cursorLine = l;
            cursorCol = c;
          }
        "
      />
      <div class="w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />
      <PreviewPane
        class="flex-1 overflow-hidden"
        @request-open="(path?: string) => (path ? openPath(path) : openFile())"
      />
    </div>
    <StatusBar :line="cursorLine" :column="cursorCol" />

    <ExportDialog
      v-if="showExport"
      @confirm="
        () => {
          showExport = false;
          runExport();
        }
      "
      @cancel="showExport = false"
    />
    <SettingsDialog v-if="showSettings" @close="showSettings = false" />
  </div>
</template>
