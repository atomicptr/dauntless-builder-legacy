import { Bookmark, BookmarkBorder, ContentCopy, Undo } from "@mui/icons-material";
import { Fab, IconButton, useTheme } from "@mui/material";
import { adSpaceMobileBannerHeight } from "@src/components/AdSpaceFloating";
import InputDialog from "@src/components/InputDialog";
import useIsMobile from "@src/hooks/is-mobile";
import { buildModelView, lastSelectedBuildModelView } from "@src/state/build";
import {
    addFavorite,
    favoritesAtom,
    favoritesView,
    isBuildInFavorites,
    removeFavoriteByBuildId,
} from "@src/state/favorites";
import { buildIdRegex } from "@src/utils/build-id";
import { defaultBuildName } from "@src/utils/default-build-name";
import { adsEnabled } from "@src/utils/env-tools";
import { useAtomValue, useSetAtom } from "jotai";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

const BuildMenu: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useIsMobile();
    const theme = useTheme();

    const build = useAtomValue(buildModelView);
    const lastEditedBuild = useAtomValue(lastSelectedBuildModelView);

    const favorites = useAtomValue(favoritesView);
    const setFavorites = useSetAtom(favoritesAtom);

    const [inputDialogOpen, setInputDialogOpen] = useState(false);

    const buildId = build.serialize();

    const isUserEditedBuild = build.serialize() === lastEditedBuild?.serialize();
    const isFavorite = isBuildInFavorites(favorites, buildId);
    const isCopyToClipboardEnabled = navigator.clipboard !== undefined;

    if (buildIdRegex.exec(location.pathname) === null) {
        return null;
    }

    const handleCopyToClipboardClicked = async () => {
        await navigator.clipboard.writeText(window.location.toString());
        enqueueSnackbar(t("components.build-menu.copied-to-clipboard"));
    };

    const handleSaveToFavorites = (name: string) => {
        setFavorites(addFavorite({ buildId, name }));
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
                        setFavorites(removeFavoriteByBuildId(buildId));
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
                            bottom: adsEnabled ? `${adSpaceMobileBannerHeight}px` : theme.spacing(2),
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
