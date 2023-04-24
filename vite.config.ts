import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { resolve } from 'path'

export default defineConfig({
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler',
        }
    },
    build: {
        sourcemap: true
    },
    plugins: [
        vue(),
        VueI18nPlugin({
            include: resolve(__dirname, './src/langs/**'),
        }),
        splitVendorChunkPlugin(),
    ],
    server: {
        // disable hot reloading
        hmr: false
    }
});
