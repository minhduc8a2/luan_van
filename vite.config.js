import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
export default defineConfig({
    

    plugins: [
        nodePolyfills(),
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
});
