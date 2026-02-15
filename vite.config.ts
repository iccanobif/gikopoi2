import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import json5Plugin from 'vite-plugin-json5'

const backendHostname = process.env.IS_DEV_DOCKER_CONTAINER == "true"
                      ? "backend"
                      : "localhost";

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
        json5Plugin(),
    ],
    server: {
        hmr: false, // Hot reloading
        proxy: {
          "/api": `http://${backendHostname}:8085`,
          "/socket.io": {
            target: `ws://${backendHostname}:8085`,
            ws: true,
          }
        }
      }
});
