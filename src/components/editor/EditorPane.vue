<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, shallowRef } from "vue";
import {
  EditorView,
  keymap,
  lineNumbers,
  type ViewUpdate,
} from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { vim, Vim, getCM } from "@replit/codemirror-vim";
import { useDocumentStore } from "@/stores/document";
import { useSettingsStore } from "@/stores/settings";
import { useAppErrors } from "@/composables/useAppErrors";

const emit = defineEmits<{
  "cursor-change": [line: number, column: number];
  save: [];
  "vim-mode-change": [mode: string];
}>();

const docStore = useDocumentStore();
const settingsStore = useSettingsStore();
const { addError } = useAppErrors();
const containerRef = shallowRef<HTMLDivElement>();
let view: EditorView | null = null;
let vimListenerAttached = false;

const vimCompartment = new Compartment();
const themeCompartment = new Compartment();
const fontSizeCompartment = new Compartment();

function fontSizeTheme(size: number) {
  return EditorView.theme({
    ".cm-content": { fontSize: `${size}px` },
    ".cm-gutters": { fontSize: `${size}px` },
  });
}

function registerVimCommands() {
  Vim.defineEx("write", "w", () => {
    emit("save");
  });
}

function attachVimModeListener() {
  if (!view || vimListenerAttached) return;
  const cm = getCM(view);
  if (!cm) return;
  cm.on("vim-mode-change", ({ mode }: { mode: string }) => {
    emit("vim-mode-change", mode.toUpperCase());
  });
  vimListenerAttached = true;
}

onMounted(() => {
  if (!containerRef.value) return;

  const state = EditorState.create({
    doc: docStore.content,
    extensions: [
      history(),
      lineNumbers(),
      EditorView.lineWrapping,
      markdown({ codeLanguages: languages }),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
      }),
      fontSizeCompartment.of(fontSizeTheme(settingsStore.editorFontSize)),
      themeCompartment.of(settingsStore.theme === "dark" ? oneDark : []),
      vimCompartment.of(settingsStore.vimMode ? [vim()] : []),
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          const value = update.state.doc.toString();
          if (value !== docStore.content) {
            docStore.setContent(value);
          }
        }
        if (update.selectionSet || update.docChanged) {
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          emit("cursor-change", line.number, pos - line.from + 1);
        }
      }),
    ],
  });

  view = new EditorView({ state, parent: containerRef.value });

  if (settingsStore.vimMode) {
    registerVimCommands();
    attachVimModeListener();
    emit("vim-mode-change", "NORMAL");
  }
});

// Sync store → editor when file opened externally
watch(
  () => docStore.content,
  (newContent) => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== newContent) {
      const head = view.state.selection.main.head;
      const clampedHead = Math.min(head, newContent.length);
      view.dispatch({
        changes: { from: 0, to: current.length, insert: newContent },
        selection: { anchor: clampedHead },
      });
    }
  },
);

// Sync theme changes
watch(
  () => settingsStore.theme,
  (theme) => {
    view?.dispatch({
      effects: themeCompartment.reconfigure(theme === "dark" ? oneDark : []),
    });
  },
);

// Sync font size changes
watch(
  () => settingsStore.editorFontSize,
  (size) => {
    view?.dispatch({
      effects: fontSizeCompartment.reconfigure(fontSizeTheme(size)),
    });
  },
);

// Toggle vim mode
watch(
  () => settingsStore.vimMode,
  (enabled) => {
    try {
      view?.dispatch({
        effects: vimCompartment.reconfigure(enabled ? [vim()] : []),
      });
      if (enabled) {
        registerVimCommands();
        attachVimModeListener();
        emit("vim-mode-change", "NORMAL");
      } else {
        emit("vim-mode-change", "");
      }
    } catch {
      settingsStore.setVimMode(false);
      addError(
        "Vim mode failed to initialize — falling back to normal mode.",
        "warning",
      );
    }
  },
);

onBeforeUnmount(() => {
  view?.destroy();
  view = null;
});
</script>

<template>
  <div ref="containerRef" class="editor-pane w-full h-full" />
</template>
