import { ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import theme from "./components/theme/theme";
import NotFound from "./pages/404/NotFound";
import Build from "./pages/build/Build";
import BuildSearch from "./pages/build/BuildSearch";
import MetaBuilds from "./pages/build/MetaBuilds";
import NewBuild from "./pages/build/NewBuild";
import Home from "./pages/home/Home";
import Settings from "./pages/settings/Settings";
import { store } from "./store";

const DauntlessBuilderApp = () => {
    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <Provider store={store}>
                    <Layout>
                        <Routes>
                            <Route path="/">
                                <Route
                                    index
                                    element={<Home />}
                                />

                                <Route path="b">
                                    <Route
                                        index
                                        element={<Navigate to={"/b/new"} />}
                                    />
                                    <Route
                                        path="new"
                                        element={<NewBuild />}
                                    />
                                    <Route
                                        path="search"
                                        element={<BuildSearch />}
                                    />
                                    <Route
                                        path="meta"
                                        element={<MetaBuilds />}
                                    />
                                    <Route
                                        path=":buildId"
                                        element={<Build />}
                                    />
                                </Route>

                                <Route
                                    path="/settings"
                                    element={<Settings />}
                                />

                                <Route
                                    path="*"
                                    element={<NotFound />}
                                />
                            </Route>
                        </Routes>
                    </Layout>
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