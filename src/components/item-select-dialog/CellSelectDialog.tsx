import { Close, Search } from "@mui/icons-material";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { itemPickerDefaultImageSize, rarityColor } from "@src/components/theme/theme";
import { findCellByVariantName, findPerkByName } from "@src/data/BuildModel";
import { Cell, CellType } from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import { ItemRarity } from "@src/data/ItemRarity";
import { ItemType, itemTypeIdentifier } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import useIsMobile from "@src/hooks/is-mobile";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DialogCommon, dialogWidth } from "./dialog-common";

interface CellSelectDialogProps {
    open: boolean;
    itemType: ItemType;
    cellIndex: number | null;
    cellType: CellType | null;
    handleClose: () => void;
    onCellSelected: (variant: string, itemType: ItemType, index: number) => void;
}

interface CellButtonProps {
    rarity: ItemRarity;
}

const CellButton = styled(Button)<CellButtonProps>(({ rarity, theme }) => ({
    "&:hover": {
        background: rarityColor[rarity].light,
    },
    background: rarityColor[rarity].main,
    color: theme.palette.grey[50],
}));

const imageSize = itemPickerDefaultImageSize;

const CellSelectDialog: React.FC<CellSelectDialogProps> = ({
    open,
    itemType,
    cellIndex,
    cellType,
    handleClose,
    onCellSelected,
}) => {
    if (cellIndex === null) {
        return null;
    }

    if (cellType === null) {
        return null;
    }

    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const title = t("components.item-select-dialog.select-text", { name: t(itemTypeIdentifier(ItemType.Cell)) });

    const [searchValue, setSearchValue] = useState<string>("");

    const filteredItems = useMemo(
        () =>
            Object.values(dauntlessBuilderData.cells)
                .filter(cell => cellType === CellType.Prismatic || cell.slot === cellType)
                .filter(cell => cell.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1),
        [searchValue, cellType],
    );

    const findPerkByCell = (cell: Cell): Perk | null => {
        const variantName = Object.keys(cell.variants).at(-1) as string;
        const variant = cell.variants[variantName] as { perks: { [perkName: string]: number } };
        const perkName = Object.keys(variant.perks)[0];
        return findPerkByName(perkName);
    };

    return (
        <Dialog
            TransitionComponent={DialogCommon}
            fullScreen={isMobile}
            fullWidth
            maxWidth={dialogWidth}
            open={open}>
            {isMobile ? (
                <AppBar
                    sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            component="div"
                            sx={{ flex: 1, ml: 2, userSelect: "none" }}
                            variant="h6">
                            {title}
                        </Typography>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            edge="start"
                            onClick={handleClose}>
                            <Close />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            ) : (
                <DialogTitle>{title}</DialogTitle>
            )}

            <DialogContent>
                <Box
                    sx={{ alignItems: "flex-end", display: "flex", m: 1 }}>
                    <Search
                        sx={{ color: "action.active", mr: 1, my: 0.5 }} />
                    <TextField
                        fullWidth
                        onChange={ev => setSearchValue(ev.target.value)}
                        placeholder={"Search"}
                        value={searchValue}
                        variant="standard" />
                </Box>

                <List
                    style={{ maxHeight: "100%", overflow: "auto" }}>
                    {filteredItems.map((cell, index) => (
                        <ListItem
                            key={index}
                            component={"div"}
                            disablePadding
                            sx={{ mb: 2, width: "100%" }}>
                            <Card
                                sx={{ width: "100%" }}>
                                <Box
                                    sx={{
                                        alignItems: "center",
                                        display: "flex",
                                        flexDirection: "row",
                                        height: "100%",
                                        justifyContent: "flex-start",
                                        width: "100%",
                                    }}>
                                    <Box
                                        sx={{
                                            alignItems: "center",
                                            display: "flex",
                                            justifyContent: "center",
                                            pl: 2,
                                            pr: 2,
                                        }}>
                                        <CardMedia
                                            component="img"
                                            image={`/assets/icons/perks/${cell.slot}.png`}
                                            sx={{ height: imageSize, width: imageSize }} />
                                    </Box>
                                    <CardContent>
                                        <Typography
                                            component="div"
                                            sx={{ alignItems: "center", display: "flex", mb: 1 }}
                                            variant="h5">
                                            {t(itemTranslationIdentifier(ItemType.Cell, cell.name, "name"))}
                                        </Typography>

                                        <Typography>
                                            {t(
                                                itemTranslationIdentifier(
                                                    ItemType.Perk,
                                                    findPerkByCell(cell)?.name ?? "null",
                                                    "description",
                                                ),
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Box>
                                <CardActions
                                    sx={{ justifyContent: "flex-end" }}>
                                    {Object.keys(cell.variants).map((variant, index) => {
                                        const cell = findCellByVariantName(variant);
                                        const variantIndex =
                                            cell != null && variant !== null
                                                ? Object.keys(cell.variants).indexOf(variant)
                                                : -1;
                                        const rarity =
                                            cell != null && variant !== null
                                                ? cell.variants[variant].rarity
                                                : ItemRarity.Uncommon;
                                        return (
                                            <CellButton
                                                key={index}
                                                onClick={() => onCellSelected(variant, itemType, cellIndex)}
                                                rarity={rarity}
                                                sx={{ flexGrow: isMobile ? 1 : 0 }}
                                                variant="contained">
                                                +{variantIndex + 1}
                                            </CellButton>
                                        );
                                    })}
                                </CardActions>
                            </Card>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}>{t("terms.unselect")}
                </Button>
                <Button
                    onClick={handleClose}>{t("terms.close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CellSelectDialog;
