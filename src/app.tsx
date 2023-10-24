/* eslint-disable simple-import-sort/imports */
import "./i18n";
/* eslint-enable simple-import-sort/imports */
import { registerSW } from "virtual:pwa-register";
import { Slide, ThemeProvider } from "@mui/material";
import About from "@src/pages/about/About";
import { SnackbarProvider } from "notistack";
import React, { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { makeTheme } from "./components/theme";
import NotFound from "./pages/404/NotFound";
import Build from "./pages/build/Build";
import BuildFinder from "./pages/build/BuildFinder";
import MetaBuilds from "./pages/build/MetaBuilds";
import NewBuild from "./pages/build/NewBuild";
import Home from "./pages/home/Home";
import Settings from "./pages/settings/Settings";
import BackgroundTasks from "@src/components/BackgroundTasks";
import Favorites from "@src/pages/favorites/Favorites";
import useIsMobile from "@src/hooks/is-mobile";
import log from "@src/utils/logger";
import SomethingWentWrong from "@src/components/SomethingWentWrong";
import { ErrorBoundary } from "react-error-boundary";
import useIsLightMode from "@src/hooks/light-mode";

const DauntlessBuilderApp = () => {
    const isMobile = useIsMobile();

    const lightModeEnabled = useIsLightMode();

    const theme = makeTheme(lightModeEnabled ? "light" : "dark");

    return (
        <ThemeProvider theme={theme}>
            <ErrorBoundary
                FallbackComponent={SomethingWentWrong}
                onError={(e, info) => log.error(e.message, { info })}
            >
                <BrowserRouter>
                    <SnackbarProvider
                        TransitionComponent={Slide}
                        anchorOrigin={{
                            horizontal: isMobile ? "center" : "right",
                            vertical: "bottom",
                        }}
                        maxSnack={3}
                    >
                        <Layout>
                            <Routes>
                                <Route path="/">
                                    <Route
                                        element={<Home />}
                                        index
                                    />

                                    <Route path="b">
                                        <Route
                                            element={<Navigate to={"/b/new"} />}
                                            index
                                        />
                                        <Route
                                            element={<NewBuild />}
                                            path="new"
                                        />
                                        <Route
                                            element={<BuildFinder />}
                                            path="finder"
                                        >
                                            <Route
                                                element={<BuildFinder />}
                                                path=":weaponType"
                                            >
                                                <Route
                                                    element={<BuildFinder />}
                                                    path=":finderConfig"
                                                />
                                            </Route>
                                        </Route>
                                        <Route
                                            element={<MetaBuilds />}
                                            path="meta"
                                        >
                                            <Route
                                                element={<MetaBuilds />}
                                                path=":weaponType"
                                            >
                                                <Route
                                                    element={<MetaBuilds />}
                                                    path=":category"
                                                />
                                            </Route>
                                        </Route>
                                        <Route
                                            element={<Build />}
                                            path=":buildId"
                                        />
                                    </Route>

                                    <Route
                                        element={<Favorites />}
                                        path="/favorites"
                                    />

                                    <Route
                                        element={<About />}
                                        path="/about"
                                    />

                                    <Route
                                        element={<Settings />}
                                        path="/settings"
                                    />

                                    <Route
                                        element={<NotFound />}
                                        path="*"
                                    />
                                </Route>
                            </Routes>
                            <BackgroundTasks />
                        </Layout>
                    </SnackbarProvider>
                </BrowserRouter>
            </ErrorBoundary>
        </ThemeProvider>
    );
};

let container: HTMLElement | null = null;
let root: Root | null = null;

if ("serviceWorker" in navigator) {
    const updateSW = registerSW({
        onNeedRefresh() {
            log.debug("Service Worker needs update...");
            updateSW(true).then(() => {
                log.debug("Service Worker updated!");
            });
        },
        onRegistered(registration) {
            if (!registration) {
                return;
            }
            const interval = 1000 * 60 * 60; // 1h
            setInterval(() => {
                registration.update();
            }, interval);
        },
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (!container) {
        container = document.querySelector<HTMLElement>("#app");

        if (!container) {
            return;
        }

        root = createRoot(container);
    }

    root?.render(
        <StrictMode>
            <DauntlessBuilderApp />
        </StrictMode>,
    );
});
