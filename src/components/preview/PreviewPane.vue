<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from "vue";
import { usePreviewStore } from "@/stores/preview";
import { useDocumentStore } from "@/stores/document";
import { useSettingsStore } from "@/stores/settings";
import { markdownService } from "@/services/markdown";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import PreviewEmpty from "./PreviewEmpty.vue";

const emit = defineEmits<{ "request-open": [path?: string] }>();

const previewStore = usePreviewStore();
const docStore = useDocumentStore();
const settingsStore = useSettingsStore();
let renderDebounceTimer: ReturnType<typeof setTimeout> | null = null;

async function renderContent() {
  if (!docStore.content) return;

  previewStore.setRendering(true);
  previewStore.clearBrokenImages();

  try {
    const basePath = docStore.filePath
      ? docStore.filePath.replace(/[/\\][^/\\]+$/, "")
      : undefined;

    const { html, brokenImages } = await markdownService.render(
      docStore.content,
      {
        basePath,
        theme: settingsStore.theme,
      },
    );

    previewStore.setHtml(html);
    for (const p of brokenImages) previewStore.addBrokenImage(p);
  } catch (err) {
    previewStore.setRenderError(
      err instanceof Error ? err.message : "Render failed",
    );
  } finally {
    previewStore.setRendering(false);
  }
}

function scheduleRender() {
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(renderContent, 150);
}

watch(() => docStore.content, scheduleRender);
watch(() => settingsStore.theme, renderContent);

// Drag-and-drop: accept .md files dropped onto the preview pane
let unlistenDragDrop: (() => void) | null = null;

onMounted(async () => {
  if (docStore.content) await renderContent();

  const window = getCurrentWebviewWindow();
  unlistenDragDrop = await window.onDragDropEvent((event) => {
    if (event.payload.type !== "drop") return;
    const paths: string[] =
      (event.payload as { type: string; paths: string[] }).paths ?? [];
    const mdPath = paths.find((p) => /\.(md|markdown)$/i.test(p));
    if (mdPath) {
      // Delegate to useDocument — emit event consumed by App.vue
      emit("request-open", mdPath as never);
    }
  });
});

onBeforeUnmount(() => {
  unlistenDragDrop?.();
  if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
});
</script>

<template>
  <div class="preview-pane relative w-full h-full flex flex-col">
    <PreviewEmpty
      v-if="!docStore.content && !docStore.filePath"
      @open="emit('request-open')"
    />

    <div
      v-else-if="previewStore.renderError"
      class="flex items-center justify-center h-full text-red-500 text-sm p-4"
    >
      Preview unavailable: {{ previewStore.renderError }}
    </div>

    <iframe
      v-show="docStore.content || docStore.filePath"
      ref="iframeRef"
      class="flex-1 w-full border-none"
      sandbox="allow-same-origin allow-scripts"
      :srcdoc="previewStore.html"
      title="Markdown Preview"
    />
  </div>
</template>
