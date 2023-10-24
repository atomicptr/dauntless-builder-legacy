import { BuildModel } from "@src/data/BuildModel";
import useDevMode from "@src/hooks/dev-mode";
import { stateIdent } from "@src/state/common";
import { configurationAtom, setDevMode } from "@src/state/configuration";
import { addFavorite, favoritesAtom, favoritesView, isBuildInFavorites } from "@src/state/favorites";
import log, { LogLevel } from "@src/utils/logger";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect } from "react";

const BackgroundTasks: React.FC = () => {
    const favorites = useAtomValue(favoritesView);
    const setFavorites = useSetAtom(favoritesAtom);
    const devMode = useDevMode();
    const setConfiguration = useSetAtom(configurationAtom);

    useEffect(() => {
        // import old favorites
        if ("__db_favorites" in localStorage) {
            const favoritesData = JSON.parse(localStorage.getItem("__db_favorites") ?? "{}");
            log.debug("Found old Dauntless Builder favorites, will try to import them", { favorites });
            Object.entries(favoritesData).forEach(([buildId, value]) => {
                if (BuildModel.isValid(buildId) && !isBuildInFavorites(favorites, buildId)) {
                    const name = value as string;
                    setFavorites(addFavorite({ buildId, name }));
                }
            });
            localStorage.removeItem("__db_favorites");
        }

        // import developer mode setting
        if ("__db_developer_mode" in localStorage) {
            setConfiguration(setDevMode(localStorage.getItem("__db_developer_mode") === "enabled"));
            localStorage.removeItem("__db_developer_mode");
        }

        // remove old dauntless-builder.com localStorage entries
        ["__db_scriptversion", "__db_settings_theme", "__db_data", "__db_meta", "__db_map", "__db_lastupdate"].forEach(
            key => {
                if (key in localStorage) {
                    localStorage.removeItem(key);
                }
            },
        );

        // replace old redux state with jotai
        if ("state" in localStorage) {
            const state = JSON.parse(localStorage.getItem("state") ?? "{}");
            log.debug("Found old redux state, replacing it with jotai...");
            Object.entries(state).forEach(([key, value]) => {
                localStorage.setItem(stateIdent(key), JSON.stringify(value));
            });
            localStorage.removeItem("state");
            window.location.reload();
        }
    }, [setConfiguration, setFavorites, favorites]);

    useEffect(() => {
        log.setLogLevel(devMode ? LogLevel.Debug : LogLevel.Info);
    }, [devMode]);

    return null;
};

export default BackgroundTasks;
