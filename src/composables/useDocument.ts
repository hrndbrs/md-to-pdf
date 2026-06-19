import { confirm } from "@tauri-apps/plugin-dialog";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { fileSystemService } from "@/services/fileSystem";
import { useDocumentStore } from "@/stores/document";
import { useAppErrors } from "@/composables/useAppErrors";

export function useDocument() {
  const docStore = useDocumentStore();
  const { addError } = useAppErrors();

  async function openFile() {
    const path = await fileSystemService.showOpenDialog();
    if (!path) return;
    try {
      const content = await fileSystemService.readFile(path);
      docStore.openFile(path, content);
      await updateWindowTitle();
    } catch (err) {
      addError(
        `Failed to open file: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function newDocument() {
    docStore.newDocument();
    await updateWindowTitle();
  }

  async function save() {
    if (!docStore.filePath) {
      return saveAs();
    }
    try {
      await fileSystemService.writeFile(docStore.filePath, docStore.content);
      docStore.markSaved();
      await updateWindowTitle();
    } catch (err) {
      addError(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function saveAs() {
    const path = await fileSystemService.showSaveDialog(docStore.fileName);
    if (!path) return;
    try {
      await fileSystemService.writeFile(path, docStore.content);
      docStore.markSaved(path);
      await updateWindowTitle();
    } catch (err) {
      addError(
        `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async function canClose(): Promise<boolean> {
    if (!docStore.isDirty) return true;
    return confirm(
      `"${docStore.fileName}" has unsaved changes. Close anyway?`,
      {
        title: "Unsaved Changes",
        kind: "warning",
      },
    );
  }

  async function updateWindowTitle() {
    const dirty = docStore.isDirty ? "● " : "";
    const name = docStore.fileName;
    await getCurrentWebviewWindow().setTitle(`${dirty}${name} — md-to-pdf`);
  }

  async function openPath(path: string) {
    try {
      const content = await fileSystemService.readFile(path);
      docStore.openFile(path, content);
      await updateWindowTitle();
    } catch (err) {
      addError(
        `Failed to open file: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return { openFile, newDocument, save, saveAs, canClose, updateWindowTitle, openPath };
}
