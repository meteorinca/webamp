import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  // Use relative base path so GitHub Pages hosted at /<repo-name>/ loads assets correctly
  base: "./",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 3000,
  },
  resolve: {
    alias: {
      "ani-cursor": path.resolve(__dirname, "src/vendors/ani-cursor/index.ts"),
      "winamp-eqf": path.resolve(__dirname, "src/vendors/winamp-eqf/index.ts"),
    },
  },
  assetsInclude: ["**/*.wsz", "**/*.mp3", "**/*.milk"],
  plugins: [
    react(),
    nodePolyfills(),
  ],
});
