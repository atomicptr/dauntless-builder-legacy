import { BuildModel } from "@src/data/BuildModel";
import { selectConfiguration, setDevMode } from "@src/features/configuration/configuration-slice";
import { addFavorite, isBuildInFavorites, selectFavorites } from "@src/features/favorites/favorites-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import log, { LogLevel } from "@src/utils/logger";
import React, { useEffect } from "react";

const BackgroundTasks: React.FC = () => {
    const dispatch = useAppDispatch();
    const favorites = useAppSelector(selectFavorites);
    const configuration = useAppSelector(selectConfiguration);

    useEffect(() => {
        // import old favorites
        if ("__db_favorites" in localStorage) {
            const favoritesData = JSON.parse(localStorage.getItem("__db_favorites") ?? "{}");
            log.debug("Found old Dauntless Builder favorites, will try to import them", { favorites });
            Object.entries(favoritesData).forEach(([buildId, value]) => {
                if (BuildModel.isValid(buildId) && !isBuildInFavorites(favorites, buildId)) {
                    const name = value as string;
                    dispatch(addFavorite({ buildId, name }));
                }
            });
            localStorage.removeItem("__db_favorites");
        }

        // import developer mode setting
        if ("__db_developer_mode" in localStorage) {
            dispatch(setDevMode(localStorage.getItem("__db_developer_mode") === "enabled"));
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
    });

    useEffect(() => {
        log.setLogLevel(configuration.devMode ? LogLevel.Debug : LogLevel.Info);
    }, [configuration.devMode]);

    return null;
};

export default BackgroundTasks;
