import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import ViteFaviconsPlugin from "vite-plugin-favicon";

export default defineConfig(({ command, mode }) => {
    const isBuild = command === "build";
    const isDevMode = mode === "development";

    return {
        define: {
            DB_DEVMODE: isDevMode,
        },
        build: {
            minify: !isDevMode,
            sourcemap: isDevMode,
            outDir: "dist",
            assetsDir: "assets",
        },
        plugins: [
            react(),
            VitePWA({}),
            isBuild ? ViteFaviconsPlugin("./public/assets/icon.png") : null, // https://github.com/josh-hemphill/vite-plugin-favicon/pull/4
        ],
    };
});
