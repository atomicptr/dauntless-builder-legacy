import { Bookmark, BookmarkBorder, ContentCopy, Undo } from "@mui/icons-material";
import { Fab, IconButton, useTheme } from "@mui/material";
import InputDialog from "@src/components/InputDialog";
import { selectBuild, selectLastEditedBuild } from "@src/features/build/build-slice";
import {
    addFavorite,
    isBuildInFavorites,
    removeFavoriteByBuildId,
    selectFavorites,
} from "@src/features/favorites/favorites-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import { defaultBuildName } from "@src/utils/default-build-name";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

const BuildMenu: React.FC = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useIsMobile();
    const theme = useTheme();

    const build = useAppSelector(selectBuild);
    const lastEditedBuild = useAppSelector(selectLastEditedBuild);
    const favorites = useAppSelector(selectFavorites);

    const [inputDialogOpen, setInputDialogOpen] = useState(false);

    const buildId = build.serialize();

    const isUserEditedBuild = build.serialize() === lastEditedBuild?.serialize();
    const isFavorite = isBuildInFavorites(favorites, buildId);
    const isCopyToClipboardEnabled = navigator.clipboard !== undefined;

    const buildRegex = /\/b\/[A-Za-z0-9]{50,}/;

    if (buildRegex.exec(location.pathname) === null) {
        return null;
    }

    const handleCopyToClipboardClicked = async () => {
        await navigator.clipboard.writeText(window.location.toString());
        enqueueSnackbar(t("components.build-menu.copied-to-clipboard"));
    };

    const handleSaveToFavorites = (name: string) => {
        dispatch(addFavorite({ buildId, name }));
        enqueueSnackbar(t("components.build-menu.added-build-to-favorites", { name }));
        setInputDialogOpen(false);
    };

    return (
        <>
            {isUserEditedBuild ? null : (
                <IconButton
                    color="inherit"
                    component={NavLink}
                    size="large"
                    title={t("components.build-menu.open-last-edited-build")}
                    to={`/b/${lastEditedBuild?.serialize()}`}
                >
                    <Undo />
                </IconButton>
            )}
            <IconButton
                color="inherit"
                onClick={() => {
                    if (isFavorite) {
                        const name = favorites.find(fav => fav.buildId === buildId)?.name ?? defaultBuildName(build);
                        dispatch(removeFavoriteByBuildId(buildId));
                        enqueueSnackbar(t("components.build-menu.remove-build-from-favorites", { name }));
                        return;
                    }

                    setInputDialogOpen(true);
                }}
                size="large"
                title={
                    isFavorite ? t("components.build-menu.unfavorite-build") : t("components.build-menu.favorite-build")
                }
            >
                {isFavorite ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>

            {isCopyToClipboardEnabled ? (
                isMobile ? (
                    <Fab
                        color="primary"
                        onClick={handleCopyToClipboardClicked}
                        sx={{
                            bottom: theme.spacing(2),
                            position: "fixed",
                            right: theme.spacing(3),
                        }}
                        title={t("components.build-menu.copy-to-clipboard")}
                    >
                        <ContentCopy />
                    </Fab>
                ) : (
                    <IconButton
                        color="inherit"
                        onClick={handleCopyToClipboardClicked}
                        size="large"
                        title={t("components.build-menu.copy-to-clipboard")}
                    >
                        <ContentCopy />
                    </IconButton>
                )
            ) : null}

            <InputDialog
                defaultInput={defaultBuildName(build)}
                label={t("components.build-menu.build-name")}
                onClose={() => setInputDialogOpen(false)}
                onConfirm={handleSaveToFavorites}
                open={inputDialogOpen}
                title={t("components.build-menu.set-build-name")}
            />
        </>
    );
};

export default BuildMenu;
