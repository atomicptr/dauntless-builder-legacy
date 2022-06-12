import { Close, FilterAlt, FilterAltOff, Search, Star, StarOutline, UnfoldLess, UnfoldMore } from "@mui/icons-material";
import {
    AppBar,
    Badge,
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
    useTheme,
} from "@mui/material";
import { DialogTransition } from "@src/components/DialogTransition";
import ItemPicker, { ItemPickerItem } from "@src/components/ItemPicker";
import OmnicellCard from "@src/components/OmnicellCard";
import UniqueEffectCard from "@src/components/UniqueEffectCard";
import VirtualizedList from "@src/components/VirtualizedList";
import { Armour, ArmourType } from "@src/data/Armour";
import { CellType } from "@src/data/Cell";
import { ElementalType } from "@src/data/ElementalType";
import { isArmourType, ItemType, itemTypeData, itemTypeLocalizationIdentifier } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Omnicell } from "@src/data/Omnicell";
import { Weapon, WeaponType } from "@src/data/Weapon";
import {
    GenericItemType,
    selectFilterCount,
    selectItemSelectFilter,
} from "@src/features/item-select-filter/item-select-filter-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppSelector } from "@src/hooks/redux";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ItemSelectDialogProps {
    open: boolean;
    itemType: ItemType;
    handleClose: () => void;
    onItemSelected: (item: ItemPickerItem, itemType: ItemType, isPowerSurged: boolean) => void;
    preDefinedFilters?: FilterFunc[];
    filterComponents?: (itemType: ItemType) => ReactNode;
    disableUniqueEffectDisplay?: boolean;
    disablePowerSurgeSelection?: boolean;
    disableComponentsInside?: boolean;
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
    disableUniqueEffectDisplay,
    disablePowerSurgeSelection,
    disableComponentsInside,
}) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const theme = useTheme();

    const title = t("components.item-select-dialog.select-text", { name: t(itemTypeLocalizationIdentifier(itemType)) });

    const hasCollapsableEffect =
        [ItemType.Weapon, ItemType.Head, ItemType.Omnicell].indexOf(itemType) > -1 && !disableUniqueEffectDisplay;
    const canBePowerSurged =
        [ItemType.Weapon, ItemType.Head, ItemType.Torso, ItemType.Arms, ItemType.Legs].indexOf(itemType) > -1;

    const [searchValue, setSearchValue] = useState<string>("");
    const [powerSurged, setPowerSurged] = useState<boolean>(true);
    const [showFilters, setShowFilters] = useState<boolean>(!isMobile);
    const [showUniqueEffects, setShowUniqueEffects] = useState<boolean>(!isMobile && !disableUniqueEffectDisplay);

    const filterAreaRef = useRef<HTMLElement>(null);

    const itemFilter = useAppSelector(selectItemSelectFilter);
    const filterCount = useAppSelector(selectFilterCount);

    const preFilteredItems = useMemo(
        () =>
            Object.values(itemTypeData(itemType)).filter(item =>
                (preDefinedFilters ?? []).every(func => func(item, itemType)),
            ),
        [itemType, preDefinedFilters],
    );

    const selectedFilters = useMemo(() => {
        if (itemType === ItemType.Weapon) {
            const { weaponTypes, elementTypes, perks, cellSlots } = itemFilter[ItemType.Weapon];
            return preFilteredItems
                .filter(item =>
                    weaponTypes.length > 0 ? weaponTypes.some(wt => filterByWeaponType(wt)(item, itemType)) : true,
                )
                .filter(item =>
                    elementTypes.length > 0 ? elementTypes.some(et => filterByElement(et)(item, itemType)) : true,
                )
                .filter(item => (perks.length > 0 ? perks.some(perk => filterByPerk(perk)(item, itemType)) : true))
                .filter(item =>
                    cellSlots.length > 0
                        ? cellSlots.some(cellSlot => filterByCellSlot(cellSlot)(item, itemType))
                        : true,
                );
        }
        if (isArmourType(itemType)) {
            const { elementTypes, perks, cellSlots } = itemFilter[itemType as GenericItemType];
            return preFilteredItems
                .filter(item =>
                    elementTypes.length > 0 ? elementTypes.some(et => filterByElement(et)(item, itemType)) : true,
                )
                .filter(item => (perks.length > 0 ? perks.some(perk => filterByPerk(perk)(item, itemType)) : true))
                .filter(item =>
                    cellSlots.length > 0
                        ? cellSlots.some(cellSlot => filterByCellSlot(cellSlot)(item, itemType))
                        : true,
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
            TransitionComponent={DialogTransition}
            fullScreen={isMobile}
            fullWidth
            maxWidth={dialogWidth}
            onClose={handleClose}
            open={open}
        >
            {isMobile ? (
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            component="div"
                            sx={{ flex: 1, ml: 2, userSelect: "none" }}
                            variant="h6"
                        >
                            {title}
                        </Typography>
                        {hasCollapsableEffect ? (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={() => setShowUniqueEffects(!showUniqueEffects)}
                                sx={{ mr: 2 }}
                                title={t("pages.build.toggle-unique-effects")}
                            >
                                {showUniqueEffects ? <UnfoldLess /> : <UnfoldMore />}
                            </IconButton>
                        ) : null}

                        {filterComponents && filterComponents.length > 0 ? (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={() => setShowFilters(!showFilters)}
                                sx={{ mr: 2 }}
                                title={t("pages.build.toggle-filters")}
                            >
                                <Badge
                                    badgeContent={filterCount}
                                    color="primary"
                                >
                                    {showFilters ? <FilterAltOff /> : <FilterAlt />}
                                </Badge>
                            </IconButton>
                        ) : null}
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleClose}
                        >
                            <Close />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            ) : (
                <DialogTitle>{title}</DialogTitle>
            )}

            <DialogContent sx={{ minHeight: "80vh", overflow: "hidden" }}>
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    onChange={ev => setSearchValue(ev.target.value)}
                    placeholder={t("terms.search")}
                    sx={{ m: 1 }}
                    value={searchValue}
                    variant="standard"
                />

                {showFilters ? (
                    <Stack
                        ref={filterAreaRef}
                        spacing={2}
                        sx={{ m: 1 }}
                    >
                        {filterComponents ? filterComponents(itemType) : null}
                    </Stack>
                ) : null}

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
                                sx={{ width: "100%" }}
                            >
                                <Stack
                                    ref={rowRef}
                                    sx={{ width: "100%" }}
                                >
                                    <ItemPicker
                                        componentsBelow={() =>
                                            showUniqueEffects ? (
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
                                                                    uniqueEffect={ue}
                                                                />
                                                            ))
                                                        : null}

                                                    {itemType === ItemType.Omnicell ? (
                                                        <OmnicellCard item={item as Omnicell} />
                                                    ) : null}
                                                </>
                                            ) : null
                                        }
                                        componentsInside={() =>
                                            (itemType === ItemType.Weapon || isArmourType(itemType)) &&
                                            !disableComponentsInside ? (
                                                    <Typography
                                                        color="text.secondary"
                                                        component="div"
                                                        variant="subtitle1"
                                                    >
                                                        <Stack
                                                            direction={isMobile ? "column" : "row"}
                                                            spacing={isMobile ? 0 : 1}
                                                        >
                                                            <Box>
                                                                <b>{`${t("terms.cells")}:`}</b>
                                                            </Box>
                                                            {(Array.isArray(
                                                                (item as Weapon | Armour | Lantern | null)?.cells,
                                                            )
                                                                ? ((item as Weapon | Armour | Lantern | null)
                                                                    ?.cells as CellType[]) ?? []
                                                                : [(item as Weapon | Armour | Lantern | null)?.cells]
                                                            ).map((cellType, index) =>
                                                                cellType ? (
                                                                    <Box
                                                                        key={index}
                                                                        sx={{ alignItems: "center", display: "flex" }}
                                                                    >
                                                                        <img
                                                                            src={`/assets/icons/perks/${cellType}.png`}
                                                                            style={{ height: "16px", width: "16px" }}
                                                                        />
                                                                    &nbsp;
                                                                        {t(`terms.cell-type.${cellType}`)}
                                                                    </Box>
                                                                ) : null,
                                                            )}
                                                        </Stack>
                                                    </Typography>
                                                ) : null
                                        }
                                        isPowerSurged={canBePowerSurged && powerSurged}
                                        item={item}
                                        onClick={() => onItemSelected(item, itemType, powerSurged)}
                                        type={itemType}
                                    />
                                </Stack>
                            </ListItem>
                        );
                    }}
                    subtractFromHeight={showFilters ? filterAreaRef.current?.clientHeight ?? 0 : 0}
                />
            </DialogContent>

            <DialogActions>
                <Box sx={{ width: theme.spacing(2) }} />
                {!isMobile ? (
                    <>
                        {hasCollapsableEffect ? (
                            <IconButton
                                color="primary"
                                edge="start"
                                onClick={() => setShowUniqueEffects(!showUniqueEffects)}
                                title={t("pages.build.toggle-unique-effects")}
                            >
                                {showUniqueEffects ? <UnfoldLess /> : <UnfoldMore />}
                            </IconButton>
                        ) : null}
                        {filterComponents && filterComponents.length > 0 ? (
                            <IconButton
                                color="primary"
                                edge="start"
                                onClick={() => setShowFilters(!showFilters)}
                                title={t("pages.build.toggle-filters")}
                            >
                                <Badge badgeContent={filterCount}>
                                    {showFilters ? <FilterAltOff /> : <FilterAlt />}
                                </Badge>
                            </IconButton>
                        ) : null}
                    </>
                ) : null}

                {canBePowerSurged && !disablePowerSurgeSelection ? (
                    <Button
                        onClick={() => setPowerSurged(!powerSurged)}
                        startIcon={powerSurged ? <StarOutline /> : <Star />}
                    >
                        {powerSurged ? t("pages.build.power-surged-remove") : t("pages.build.power-surged-add")}
                    </Button>
                ) : null}

                <Box sx={{ flexGrow: 1 }}>{/* Spacer */}</Box>

                <Button onClick={() => onItemSelected(null, itemType, powerSurged)}>{t("terms.unselect")}</Button>
                <Button
                    onClick={handleClose}
                    sx={{ display: isMobile ? "none" : undefined }}
                >
                    {t("terms.close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ItemSelectDialog;

export const filterBySearchQuery =
    (query: string) =>
        (item: ItemPickerItem, itemType: ItemType): boolean => {
            if (!item) {
                return false;
            }

            if (item.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                return true;
            }

            if (itemType === ItemType.Weapon || isArmourType(itemType) || itemType === ItemType.Lantern) {
                const description = (item as Weapon | Armour | Lantern).description?.toLowerCase();
                return description ? description.toLowerCase().indexOf(query.toLowerCase()) > -1 : false;
            }

            return false;
        };

export const filterByWeaponType =
    (weaponType: WeaponType) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            (item as Weapon).type === weaponType;

export const filterByArmourType =
    (armourType: ArmourType) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            (item as Armour).type === armourType;

export const filterByElement =
    (elemental: ElementalType) =>
        (item: ItemPickerItem, itemType: ItemType): boolean =>
            itemType === ItemType.Weapon
                ? (item as Weapon).elemental === elemental
                : (item as Armour).strength === elemental;

export const filterByCellSlot =
    (cellSlot: CellType) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            ((item as Weapon | Armour | Lantern).cells?.indexOf(cellSlot) ?? -1) > -1;

export const filterByPerk =
    (perk: string) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            ((item as Weapon | Armour).perks ?? []).some(p => p.name === perk);

export const filterRemoveBondWeapons =
    () =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            !(item as Weapon).bond;
