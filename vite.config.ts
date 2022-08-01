import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import ViteFaviconsPlugin from "vite-plugin-favicon2";
import { VitePWA } from "vite-plugin-pwa";

const maximumFileSizeToCacheInBytes = 5 * 1024 * 1024; // 5 MB

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
            VitePWA({
                includeAssets: [
                    "assets/**/*.png",

                    // these are technically not necessary, but it's annoying that you can't access these with your
                    // browser anymore without this. Maybe we should switch to a network first SW.
                    "*.json",
                    "map/*.json",
                    "sitemap.xml",
                    "robots.txt",
                ],
                manifest: {
                    categories: [
                        "games",
                        "utilities"
                    ],
                    screenshots: [
                        {
                            label: "Screenshot of an build in Dauntless Builder",
                            platform: "wide",
                            sizes: "1920x1080",
                            src: "https://raw.githubusercontent.com/atomicptr/dauntless-builder/master/docs/assets/app-screenshot.png",
                            type: "image/png"
                        }
                    ],
                    shortcuts: [
                        {
                            description: "Create a new build!",
                            icons: [],
                            name: "New Build",
                            url: "/b/new",
                        },
                        {
                            description: "Know what perks you want? Find a fitting build right here!",
                            icons: [],
                            name: "Build Finder",
                            url: "/b/finder",
                        },
                        {
                            description: "The best builds made by the community!",
                            icons: [],
                            name: "Meta Builds",
                            url: "/b/meta",
                        }
                    ]
                },
                registerType: "autoUpdate",
                workbox: {
                    cleanupOutdatedCaches: true,
                    clientsClaim: true,
                    maximumFileSizeToCacheInBytes,
                    sourcemap: isDevMode,
                }
            }),
            command === "build"
                ? ViteFaviconsPlugin({
                    favicons: {
                        appDescription: "Create and share Dauntless builds with your friends!",
                        appName: "Dauntless Builder",
                        appleStatusBarStyle: "black-translucent",
                        background: "#121212",
                        theme_color: "#272727",
                    },
                    logo: "public/assets/icon.png",
                })
                : undefined,
        ],
        resolve: {
            alias: {
                "@json": fileURLToPath(new URL("./src/json", import.meta.url)),
                "@src": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        server: {
            port: 3000,
        },
    };
});
