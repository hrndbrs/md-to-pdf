<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, shallowRef } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { useDocumentStore } from "@/stores/document";
import { useSettingsStore } from "@/stores/settings";

// Configure Monaco to use local worker (runs once per app load)
if (!self.MonacoEnvironment) {
  self.MonacoEnvironment = {
    getWorker() {
      return new editorWorker();
    },
  };
}

const emit = defineEmits<{
  "cursor-change": [line: number, column: number];
}>();

const docStore = useDocumentStore();
const settingsStore = useSettingsStore();
const containerRef = shallowRef<HTMLDivElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
  if (!containerRef.value) return;

  editor = monaco.editor.create(containerRef.value, {
    value: docStore.content,
    language: "markdown",
    theme: settingsStore.theme === "dark" ? "vs-dark" : "vs",
    fontSize: settingsStore.editorFontSize,
    lineNumbers: "on",
    wordWrap: "on",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
  });

  editor.onDidChangeModelContent(() => {
    const value = editor!.getValue();
    if (value !== docStore.content) {
      docStore.setContent(value);
    }
  });

  editor.onDidChangeCursorPosition((e) => {
    emit("cursor-change", e.position.lineNumber, e.position.column);
  });
});

// Sync store → editor when file is opened externally (e.g., via toolbar Open)
watch(
  () => docStore.content,
  (newContent) => {
    if (editor && editor.getValue() !== newContent) {
      const pos = editor.getPosition();
      editor.setValue(newContent);
      if (pos) editor.setPosition(pos);
    }
  },
);

// Sync theme changes
watch(
  () => settingsStore.theme,
  (theme) => {
    monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
  },
);

// Sync font size changes
watch(
  () => settingsStore.editorFontSize,
  (size) => {
    editor?.updateOptions({ fontSize: size });
  },
);

onBeforeUnmount(() => {
  editor?.dispose();
  editor = null;
});
</script>

<template>
  <div ref="containerRef" class="editor-pane w-full h-full" />
</template>
