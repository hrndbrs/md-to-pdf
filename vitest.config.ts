import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/services/**", "src/stores/**", "src/composables/**"],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
