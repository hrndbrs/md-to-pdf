import { vi, beforeEach } from "vitest";

// Mock window.matchMedia — happy-dom never fires 'change' events for media queries.
// addEventListener is implemented to immediately call the handler with matches:false
// so that PDFExportService.export() resolves without waiting for the real print dialog.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => {
    const handlers: Array<(e: MediaQueryListEvent) => void> = [];
    return {
      matches: false,
      media: query,
      addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
        handlers.push(handler);
        // Fire synchronously after print() is called — simulates dialog close
        queueMicrotask(() => {
          handler({ matches: false } as MediaQueryListEvent);
        });
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

// Mock Tauri core — prevents "window.__TAURI_INTERNALS__ is not defined" in tests
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
  convertFileSrc: vi.fn((path: string) => `asset://localhost${path}`),
}));

vi.mock("@tauri-apps/api/path", () => ({
  dirname: vi.fn(async (p: string) => {
    const normalized = p.replace(/\\/g, "/");
    const parts = normalized.split("/");
    parts.pop();
    const result = parts.join("/");
    return result || ".";
  }),
  basename: vi.fn(async (p: string) => {
    const normalized = p.replace(/\\/g, "/").replace(/\/$/, "");
    return normalized.split("/").pop() ?? "";
  }),
  join: vi.fn(async (...parts: string[]) => {
    const joined = parts.join("/");
    return joined.replace(/\/+/g, "/");
  }),
}));

export const mockWebviewWindow = {
  setTitle: vi.fn().mockResolvedValue(undefined),
  onDragDropEvent: vi.fn().mockResolvedValue(() => {}),
  onCloseRequested: vi.fn().mockResolvedValue(() => {}),
};

vi.mock("@tauri-apps/api/webviewWindow", () => ({
  getCurrentWebviewWindow: vi.fn(() => mockWebviewWindow),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
  message: vi.fn(),
  ask: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn().mockImplementation(async () => ({
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
