import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ViteFaviconsPlugin from "vite-plugin-favicon";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
    const isBuild = command === "build";
    const isDevMode = mode === "development";

    return {
        build: {
            assetsDir: "assets",
            minify: !isDevMode,
            outDir: "dist",
            sourcemap: isDevMode,
        },
        define: {
            DB_DEVMODE: isDevMode,
        },
        plugins: [
            react(),
            VitePWA({}),
            isBuild ? ViteFaviconsPlugin("./public/assets/icon.png") : null, // https://github.com/josh-hemphill/vite-plugin-favicon/pull/4
        ],
    };
});
