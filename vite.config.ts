import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  root: "app",
  resolve: {
    alias: {
      "@/*": resolve("app/src"),
      "@bindings/*": resolve("app/src/bindings"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["src-tauri/**", "website/**"],
    },
  },
}));
