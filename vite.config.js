import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: '/mass_points_explorer/',

  optimizeDeps: {
    include: [
      "mapbox-gl",
      "@deck.gl/core",
      "@deck.gl/layers",
      "@deck.gl/mapbox",
      "@deck.gl/extensions",
    ],
  },

  build: {
    rollupOptions: {

      onwarn(warning, warn) {
        const msg = String(warning.message || "");
        if (
          warning.code === "MISSING_EXPORT" &&
          msg.includes('"spawn" is not exported by "__vite-browser-external"') &&
          msg.includes("@loaders.gl/worker-utils")
        ) {
          return;
        }
        warn(warning);
      },


      output: {
        manualChunks: {
          mapbox: ["mapbox-gl"],
          deckgl: [
            "@deck.gl/core",
            "@deck.gl/layers",
            "@deck.gl/mapbox",
            "@deck.gl/extensions",
          ],
          vue: ["vue"],
        },
      },
    },

  
  },
});