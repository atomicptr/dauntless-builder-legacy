import { Clear } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import ItemSelectDialog, {
    filterByArmourType,
    filterByWeaponType,
    FilterFunc,
    filterRemoveExotics,
    filterRemoveLegendaries,
} from "@src/components/ItemSelectDialog";
import MiniItemPicker from "@src/components/MiniItemPicker";
import { Armour, ArmourType } from "@src/data/Armour";
import { ItemType } from "@src/data/ItemType";
import { Weapon } from "@src/data/Weapon";
import useIsMobile from "@src/hooks/is-mobile";
import { finderAtom, setPicker } from "@src/state/finder";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";

const FinderItemPreselect = () => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const [
        { weaponType, removeExotics, removeLegendary, pickerWeapon, pickerHead, pickerTorso, pickerArms, pickerLegs },
        setFinder,
    ] = useAtom(finderAtom);

    const [itemSelectDialogOpen, setItemSelectDialogOpen] = useState(false);
    const [itemSelectDialogType, setItemSelectDialogType] = useState<ItemType>(ItemType.Weapon);
    const [itemSelectFilters, setItemSelectFilters] = useState<FilterFunc[]>([]);

    const onPickerClicked = (itemType: ItemType) => {
        const filters = match(itemType)
            .with(
                ItemType.Weapon,
                () =>
                    [filterByWeaponType(weaponType), removeLegendary ? filterRemoveLegendaries() : null].filter(
                        f => !!f,
                    ) as FilterFunc[],
            )
            .with(ItemType.Head, () => [filterByArmourType(ArmourType.Head)])
            .with(ItemType.Torso, () => [filterByArmourType(ArmourType.Torso)])
            .with(ItemType.Arms, () => [filterByArmourType(ArmourType.Arms)])
            .with(ItemType.Legs, () => [filterByArmourType(ArmourType.Legs)])
            .otherwise(() => []);

        if (removeExotics) {
            filters.push(filterRemoveExotics());
        }

        setItemSelectFilters(filters);
        setItemSelectDialogType(itemType);
        setItemSelectDialogOpen(true);
    };

    return (
        <>
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 2 : undefined}
            >
                <Typography variant="h5">{t("pages.build-finder.preselect-title")}</Typography>
                {!isMobile && <Box sx={{ flexGrow: 2 }} />}
                <Button
                    onClick={() => {
                        setFinder(setPicker(ItemType.Weapon, null));
                        setFinder(setPicker(ItemType.Head, null));
                        setFinder(setPicker(ItemType.Torso, null));
                        setFinder(setPicker(ItemType.Arms, null));
                        setFinder(setPicker(ItemType.Legs, null));
                    }}
                    startIcon={<Clear />}
                    variant={isMobile ? "outlined" : undefined}
                >
                    {t("pages.build-finder.clear-items")}
                </Button>
            </Stack>

            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
            >
                <MiniItemPicker
                    itemType={ItemType.Weapon}
                    onClick={onPickerClicked}
                    value={pickerWeapon}
                />
                <MiniItemPicker
                    itemType={ItemType.Head}
                    onClick={onPickerClicked}
                    value={pickerHead}
                />
                <MiniItemPicker
                    itemType={ItemType.Torso}
                    onClick={onPickerClicked}
                    value={pickerTorso}
                />
                <MiniItemPicker
                    itemType={ItemType.Arms}
                    onClick={onPickerClicked}
                    value={pickerArms}
                />
                <MiniItemPicker
                    itemType={ItemType.Legs}
                    onClick={onPickerClicked}
                    value={pickerLegs}
                />
            </Stack>

            <ItemSelectDialog
                disablePowerSurgeSelection
                handleClose={() => setItemSelectDialogOpen(false)}
                itemType={itemSelectDialogType}
                onItemSelected={(item, itemType, _isPowerSurged) => {
                    setFinder(setPicker(itemType, item as Weapon | Armour | null));
                    setItemSelectDialogOpen(false);
                }}
                open={itemSelectDialogOpen}
                preDefinedFilters={itemSelectFilters}
            />
        </>
    );
};

export default React.memo(FinderItemPreselect);
