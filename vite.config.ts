import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import json5Plugin from 'vite-plugin-json5'

export default defineConfig({
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler',
        }
    },
    build: {
        minify: false,
        sourcemap: true,
    },
    plugins: [
        vue(),
        splitVendorChunkPlugin(),
        json5Plugin(),
    ],
    server: {
        hmr: false, // Hot reloading
        proxy: {
          "/api": "http://localhost:8085",
          "/socket.io": {
            target: "ws://localhost:8085",
            ws: true,
          }
        }
      }
});
