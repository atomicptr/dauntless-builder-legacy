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
    InputAdornment,
    ListItem,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import ItemPicker, { ItemPickerItem } from "@src/components/item-picker/ItemPicker";
import OmnicellCard from "@src/components/omnicell-card/OmnicellCard";
import { Transition } from "@src/components/theme/transition";
import UniqueEffectCard from "@src/components/unique-effect-card/UniqueEffectCard";
import VirtualizedList from "@src/components/virtualized-list/VirtualizedList";
import { Armour } from "@src/data/Armour";
import { CellType } from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import { ArmourItemType, isArmourType, ItemType, itemTypeIdentifier } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Omnicell } from "@src/data/Omnicell";
import { Weapon } from "@src/data/Weapon";
import {
    ElementFilterItemTypes,
    selectItemSelectFilter,
} from "@src/features/item-select-filter/item-select-filter-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppSelector } from "@src/hooks/redux";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";

import { filterByElement, filterBySearchQuery, filterByWeaponType } from "./filters";

interface ItemSelectDialogProps {
    open: boolean;
    itemType: ItemType;
    handleClose: () => void;
    onItemSelected: (item: ItemPickerItem, itemType: ItemType, isPowerSurged: boolean) => void;
    preDefinedFilters?: FilterFunc[];
    filterComponents?: (itemType: ItemType) => ReactNode;
}

export type FilterFunc = (item: ItemPickerItem, itemType: ItemType) => boolean;
const dialogWidth = "md";

const ItemSelectDialog: React.FC<ItemSelectDialogProps> = ({
    open,
    itemType,
    handleClose,
    onItemSelected,
    preDefinedFilters,
    filterComponents,
}) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const title = t("components.item-select-dialog.select-text", { name: t(itemTypeIdentifier(itemType)) });

    const [searchValue, setSearchValue] = useState<string>("");
    const [powerSurged, _setPowerSurged] = useState<boolean>(true);

    const filterAreaRef = useRef<HTMLElement>(null);

    const itemFilter = useAppSelector(selectItemSelectFilter);

    const preFilteredItems = useMemo(
        () =>
            Object.values(
                match(itemType)
                    .with(ItemType.Weapon, () => dauntlessBuilderData.weapons)
                    .with(ArmourItemType, () => dauntlessBuilderData.armours)
                    .with(ItemType.Lantern, () => dauntlessBuilderData.lanterns)
                    .with(ItemType.Omnicell, () => dauntlessBuilderData.omnicells)
                    .run(),
            ).filter(item => (preDefinedFilters ?? []).every(func => func(item, itemType))),
        [itemType, preDefinedFilters],
    );

    const selectedFilters = useMemo(() => {
        if (itemType === ItemType.Weapon) {
            const { weaponType, elementType } = itemFilter[ItemType.Weapon];
            return preFilteredItems
                .filter(item =>
                    weaponType.length > 0 ? weaponType.some(wt => filterByWeaponType(wt)(item, itemType)) : true,
                )
                .filter(item =>
                    elementType.length > 0 ? elementType.some(et => filterByElement(et)(item, itemType)) : true,
                );
        }
        if (isArmourType(itemType)) {
            const { elementType } = itemFilter[itemType as ElementFilterItemTypes];
            return preFilteredItems.filter(item =>
                elementType.length > 0 ? elementType.some(et => filterByElement(et)(item, itemType)) : true,
            );
        }
        return preFilteredItems;
    }, [itemType, itemFilter, preFilteredItems]);

    const filteredItems = useMemo(
        () => selectedFilters.filter(item => filterBySearchQuery(searchValue)(item, itemType)),
        [selectedFilters, itemType, searchValue],
    );

    // reset filter values whenever open state changes
    useEffect(() => {
        setSearchValue("");
    }, [open]);

    return (
        <Dialog
            TransitionComponent={Transition}
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

            <DialogContent
                sx={{ minHeight: "80vh", overflow: "hidden" }}>
                <Stack
                    ref={filterAreaRef}
                    spacing={2}
                    sx={{ m: 1 }}>
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment
                                    position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                        onChange={ev => setSearchValue(ev.target.value)}
                        placeholder={t("terms.search")}
                        value={searchValue}
                        variant="standard" />

                    {filterComponents ? filterComponents(itemType) : null}
                </Stack>

                <VirtualizedList
                    count={filteredItems.length}
                    defaultRowHeight={300}
                    renderItems={(rowRef, index, style) => {
                        const item = filteredItems[index];

                        return (
                            <ListItem
                                key={index}
                                component={"div"}
                                disablePadding
                                style={style}
                                sx={{ width: "100%" }}>
                                <Stack
                                    ref={rowRef}
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
                        );
                    }}
                    subtractFromHeight={filterAreaRef.current?.clientHeight ?? 0} />
            </DialogContent>

            {isMobile ? null : (
                <DialogActions>
                    <Button
                        onClick={() => onItemSelected(null, itemType, powerSurged)}>{t("terms.unselect")}
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
