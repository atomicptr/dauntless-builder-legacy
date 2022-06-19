/* eslint-disable simple-import-sort/imports */
// these two files have to be included first and in this exact order
import "./i18n";
import { store } from "./store";
/* eslint-enable simple-import-sort/imports */

import { ThemeProvider } from "@mui/material";
import { Slide } from "@mui/material";
import About from "@src/pages/about/About";
import { SnackbarProvider } from "notistack";
import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import theme from "./components/theme";
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

const DauntlessBuilderApp = () => {
    const isMobile = useIsMobile();

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <Provider store={store}>
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
                                        />
                                        <Route
                                            element={<MetaBuilds />}
                                            path="meta"
                                        />
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
                </Provider>
            </BrowserRouter>
        </ThemeProvider>
    );
};

let container: HTMLElement | null = null;
let root: Root | null = null;

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
