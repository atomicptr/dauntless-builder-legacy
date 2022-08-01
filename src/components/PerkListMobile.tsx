import { Close, Warning } from "@mui/icons-material";
import {
    AppBar,
    Box,
    Card,
    CardActionArea,
    CardMedia,
    Dialog,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Slide,
    Stack,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { itemPickerDefaultImageSize } from "@src/components/theme";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import { selectBuild } from "@src/features/build/build-slice";
import useIsLightMode from "@src/hooks/light-mode";
import { useAppSelector } from "@src/hooks/redux";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React from "react";
import { useTranslation } from "react-i18next";

import { perkData, perkEffectDescriptionById } from "./PerkList";

const imageSize = itemPickerDefaultImageSize;

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return (
        <Slide
            direction="up"
            ref={ref}
            {...props}
        />
    );
});

const PerkListMobile: React.FC = () => {
    const theme = useTheme();
    const isLightMode = useIsLightMode();

    const build = useAppSelector(selectBuild);
    const { t } = useTranslation();

    type PerkEntry = { count: number; data: Perk; name: string };

    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
    const [dialogPerk, setDialogPerk] = React.useState<PerkEntry | null>(null);

    const sortedPerks = perkData(build);

    const handleClickOpen = (perk: PerkEntry) => () => {
        setDialogPerk(perk);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    return (
        <Box>
            <ListSubheader sx={{ userSelect: "none" }}>{t("terms.perks")}</ListSubheader>

            {sortedPerks.map(perk => (
                <Card
                    key={perk.name}
                    sx={{ mb: 1 }}
                >
                    <CardActionArea
                        onClick={handleClickOpen(perk)}
                        sx={{ display: "flex", justifyContent: "flex-start" }}
                    >
                        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                            <CardMedia
                                component="img"
                                image={`/assets/icons/perks/${perk.data.type}.png`}
                                sx={{
                                    filter: isLightMode ? "invert(100%)" : undefined,
                                    height: imageSize,
                                    width: imageSize,
                                }}
                            />
                        </Box>
                        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", ml: 2 }}>
                            <Stack
                                direction="column"
                                spacing={0.5}
                                sx={{ pb: 1, pt: 1 }}
                            >
                                <Typography
                                    component="div"
                                    variant="h5"
                                >
                                    {`+ ${perk.count} ${t(
                                        itemTranslationIdentifier(ItemType.Perk, perk.name, "name"),
                                    )}`}
                                </Typography>
                                <Typography>
                                    {perkEffectDescriptionById(perk.data, Math.min(perk.count, 6).toString())}
                                </Typography>
                            </Stack>
                            <Box sx={{ ml: 2 }}>{perk.count > 6 ? <Warning /> : null}</Box>
                        </Box>
                    </CardActionArea>
                </Card>
            ))}

            {dialogPerk !== null ? (
                <Dialog
                    TransitionComponent={Transition}
                    fullScreen
                    onClose={handleClose}
                    open={dialogOpen}
                >
                    <AppBar
                        sx={{
                            backgroundColor: isLightMode ? theme.palette.grey["900"] : undefined,
                            position: "relative",
                        }}
                    >
                        <Toolbar>
                            <Typography
                                component="div"
                                sx={{ flex: 1, ml: 2, userSelect: "none" }}
                                variant="h6"
                            >
                                {t(itemTranslationIdentifier(ItemType.Perk, dialogPerk.name, "name"))}
                            </Typography>
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                edge="start"
                                onClick={handleClose}
                            >
                                <Close />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <List>
                        {Object.keys(dialogPerk.data.effects).map(id => (
                            <ListItem
                                key={id}
                                sx={{
                                    color: theme.palette.grey[
                                        id === Math.max(0, Math.min(6, dialogPerk.count)).toString()
                                            ? isLightMode
                                                ? 900
                                                : 50
                                            : 400
                                    ],
                                    userSelect: "none",
                                }}
                            >
                                <ListItemText
                                    primary={`+${id}`}
                                    sx={{ mr: 2 }}
                                />
                                <ListItemText
                                    primary={perkEffectDescriptionById(dialogPerk.data, id)}
                                    sx={{ width: "100%" }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Dialog>
            ) : null}
        </Box>
    );
};

export default PerkListMobile;
