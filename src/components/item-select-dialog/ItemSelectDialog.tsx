import { Close, Search } from "@mui/icons-material";
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import ItemPicker, { ItemPickerItem } from "@src/components/item-picker/ItemPicker";
import OmnicellCard from "@src/components/item-picker/OmnicellCard";
import UniqueEffectCard from "@src/components/item-picker/UniqueEffectCard";
import { DialogCommon, dialogWidth } from "@src/components/item-select-dialog/dialog-common";
import { Armour } from "@src/data/Armour";
import { CellType } from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import { ArmourItemType, isArmourType, ItemType, itemTypeIdentifier } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Omnicell } from "@src/data/Omnicell";
import { Weapon } from "@src/data/Weapon";
import useIsMobile from "@src/hooks/is-mobile";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";

import { filterBySearchQuery } from "./filters";

interface ItemSelectDialogProps {
    open: boolean;
    itemType: ItemType;
    handleClose: () => void;
    onItemSelected: (item: ItemPickerItem, itemType: ItemType, isPowerSurged: boolean) => void;
    filters?: FilterFunc[];
}

export type FilterFunc = (item: ItemPickerItem, itemType: ItemType) => boolean;

const ItemSelectDialog: React.FC<ItemSelectDialogProps> = ({
    open,
    itemType,
    handleClose,
    onItemSelected,
    filters,
}) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const title = t("components.item-select-dialog.select-text", { name: t(itemTypeIdentifier(itemType)) });

    const [searchValue, setSearchValue] = useState<string>("");
    const [powerSurged, _setPowerSurged] = useState<boolean>(true);

    const items = match(itemType)
        .with(ItemType.Weapon, () => dauntlessBuilderData.weapons)
        .with(ArmourItemType, () => dauntlessBuilderData.armours)
        .with(ItemType.Lantern, () => dauntlessBuilderData.lanterns)
        .with(ItemType.Omnicell, () => dauntlessBuilderData.omnicells)
        .run();

    const filterFuncs: FilterFunc[] = [...(filters ?? []), filterBySearchQuery(searchValue)];

    const filteredItems = useMemo(
        () => Object.values(items).filter(item => filterFuncs.every(func => func(item, itemType))),
        [searchValue, itemType, filters],
    );

    // reset filter values whenever open state changes
    useEffect(() => {
        setSearchValue("");
    }, [open]);

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
                    {filteredItems.map((item, index) => (
                        <ListItem
                            key={index}
                            component={"div"}
                            disablePadding
                            sx={{ width: "100%" }}>
                            <Stack
                                sx={{ width: "100%" }}>
                                <ItemPicker
                                    componentsBelow={() => (
                                        <>
                                            {itemType === ItemType.Weapon || isArmourType(itemType)
                                                ? (item as Weapon | Armour).unique_effects
                                                    ?.filter(ue =>
                                                        ue.powerSurged !== undefined
                                                            ? ue.powerSurged === powerSurged
                                                            : true,
                                                    )
                                                    .map((ue, index) => (
                                                        <UniqueEffectCard
                                                            key={index}
                                                            index={index}
                                                            item={item}
                                                            itemType={itemType}
                                                            uniqueEffect={ue} />
                                                    ))
                                                : null}

                                            {itemType === ItemType.Omnicell ? (
                                                <OmnicellCard
                                                    item={item as Omnicell} />
                                            ) : null}
                                        </>
                                    )}
                                    componentsInside={() => (
                                        <Typography
                                            color="text.secondary"
                                            component="div"
                                            variant="subtitle1">
                                            <Stack
                                                direction={isMobile ? "column" : "row"}
                                                spacing={isMobile ? 0 : 1}>
                                                <Box>
                                                    <b>{t("terms.cells")}:</b>
                                                </Box>
                                                {(Array.isArray((item as Weapon | Armour | Lantern | null)?.cells)
                                                    ? ((item as Weapon | Armour | Lantern | null)
                                                        ?.cells as CellType[]) ?? []
                                                    : [(item as Weapon | Armour | Lantern | null)?.cells]
                                                ).map((cellType, index) =>
                                                    cellType ? (
                                                        <Box
                                                            key={index}
                                                            sx={{ alignItems: "center", display: "flex" }}>
                                                            <img
                                                                src={`/assets/icons/perks/${cellType}.png`}
                                                                style={{ height: "16px", width: "16px" }} />
                                                            &nbsp;
                                                            {t(`terms.cell-type.${cellType}`)}
                                                        </Box>
                                                    ) : null,
                                                )}
                                            </Stack>
                                        </Typography>
                                    )}
                                    isPowerSurged={powerSurged}
                                    item={item}
                                    onClick={() => onItemSelected(item, itemType, powerSurged)}
                                    type={itemType} />
                            </Stack>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>

            {isMobile ? null : (
                <DialogActions>
                    <Button
                        onClick={handleClose}>{t("terms.unselect")}
                    </Button>
                    <Button
                        onClick={handleClose}>{t("terms.close")}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ItemSelectDialog;
