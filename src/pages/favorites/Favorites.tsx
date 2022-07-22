import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import InputDialog from "@src/components/InputDialog";
import PageTitle from "@src/components/PageTitle";
import {
    Favorite,
    moveDownByBuildId,
    moveUpByBuildId,
    removeFavoriteByBuildId,
    selectFavorites,
    updateFavorite,
} from "@src/features/favorites/favorites-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";

const Favorites: React.FC = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const favorites = useAppSelector(selectFavorites);

    const [open, setOpen] = React.useState<boolean>(false);
    const [currentFavorite, setCurrentFavorite] = React.useState<Favorite | null>(null);

    const openDialog = (favorite: Favorite) => {
        setCurrentFavorite(favorite);
        setOpen(true);
    };

    const closeDialog = () => {
        setCurrentFavorite(null);
        setOpen(false);
    };

    const saveAndCloseDialog = (name: string) => {
        if (currentFavorite === null) {
            return;
        }
        dispatch(updateFavorite({ ...currentFavorite, name }));
        setCurrentFavorite(null);
        setOpen(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 2 }}>
            <PageTitle title={t("pages.favorites.title")} />

            {favorites.map((fav, index) => (
                <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                >
                    <Stack
                        direction="column"
                        spacing={1}
                        sx={{ justifyContent: "center" }}
                    >
                        <Button
                            disabled={index === 0}
                            onClick={() => dispatch(moveUpByBuildId(fav.buildId))}
                        >
                            <KeyboardArrowUp />
                        </Button>
                        <Button
                            disabled={index === favorites.length - 1}
                            onClick={() => dispatch(moveDownByBuildId(fav.buildId))}
                        >
                            <KeyboardArrowDown />
                        </Button>
                    </Stack>
                    <BuildCard
                        buildId={fav.buildId}
                        title={fav.name}
                    />
                    <Stack
                        direction="column"
                        spacing={1}
                        sx={{ justifyContent: "center" }}
                    >
                        <Button onClick={() => openDialog(fav)}>
                            <Edit />
                        </Button>
                        <Button onClick={() => dispatch(removeFavoriteByBuildId(fav.buildId))}>
                            <Delete />
                        </Button>
                    </Stack>
                </Stack>
            ))}

            {currentFavorite !== null && (
                <InputDialog
                    defaultInput={currentFavorite.name}
                    label={t("pages.favorites.build-name")}
                    onClose={closeDialog}
                    onConfirm={saveAndCloseDialog}
                    open={open}
                    title={t("pages.favorites.edit-name")}
                />
            )}
        </Box>
    );
};

export default Favorites;
