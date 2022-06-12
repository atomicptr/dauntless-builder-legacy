import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";
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
import { NavLink } from "react-router-dom";

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

    const saveAndCloseDialog = () => {
        if (currentFavorite === null) {
            return;
        }
        dispatch(updateFavorite(currentFavorite));
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
                    <Card sx={{ flexGrow: 10 }}>
                        <CardActionArea
                            component={NavLink}
                            sx={{ height: "100%" }}
                            to={`/b/${fav.buildId}`}
                        >
                            <CardContent>{fav.name}</CardContent>
                        </CardActionArea>
                    </Card>
                    <Stack
                        direction="column"
                        spacing={1}
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

            {currentFavorite !== null ? (
                <Dialog
                    onClose={closeDialog}
                    open={open}
                >
                    <DialogTitle>{t("pages.favorites.edit-name", { name: currentFavorite.name })}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label={t("pages.favorites.build-name")}
                            margin="dense"
                            onChange={ev => setCurrentFavorite({ ...currentFavorite, name: ev.target.value })}
                            value={currentFavorite.name}
                            variant="standard"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog}>{t("terms.cancel")}</Button>
                        <Button onClick={saveAndCloseDialog}>{t("terms.save")}</Button>
                    </DialogActions>
                </Dialog>
            ) : null}
        </Box>
    );
};

export default Favorites;
