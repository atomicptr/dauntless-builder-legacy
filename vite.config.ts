import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ViteFaviconsPlugin from "vite-plugin-favicon2";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
    const isDevMode = mode === "development";

    return {
        base: "/",
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
            command === "build"
                ? ViteFaviconsPlugin({
                    favicons: {
                        appDescription: "Create and share Dauntless builds with your friends!",
                        appName: "Dauntless Builder",
                        appleStatusBarStyle: "black-translucent",
                        background: "#121212",
                        theme_color: "#3f51b5",
                    },
                    logo: "public/assets/icon.png",
                })
                : undefined,
        ],
    };
});
