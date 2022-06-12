import { BuildModel } from "@src/data/BuildModel";
import { setDevMode } from "@src/features/configuration/configuration-slice";
import { addFavorite, isBuildInFavorites, selectFavorites } from "@src/features/favorites/favorites-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React, { useEffect } from "react";

const BackgroundTasks: React.FC = () => {
    const dispatch = useAppDispatch();
    const favorites = useAppSelector(selectFavorites);

    useEffect(() => {
        // import favorites
        if ("__db_favorites" in localStorage) {
            // TODO: import me, format {buildId: name}
            Object.entries(JSON.parse(localStorage.getItem("__db_favorites") ?? "{}")).forEach(([buildId, value]) => {
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

    return null;
};

export default BackgroundTasks;
