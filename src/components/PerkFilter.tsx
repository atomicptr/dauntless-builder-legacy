import { Box, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Stack } from "@mui/material";
import { findPerkByName } from "@src/data/BuildModel";
import dauntlessBuilderData from "@src/data/Data";
import { isArmourType, ItemType, itemTypeData } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import {
    GenericItemType,
    selectItemSelectFilter,
    setPerkFilter,
} from "@src/features/item-select-filter/item-select-filter-slice";
import useIsLightMode from "@src/hooks/light-mode";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface PerkFilterProps {
    itemType: ItemType;
}

const PerkFilter: React.FC<PerkFilterProps> = ({ itemType }) => {
    const dispatch = useAppDispatch();
    const itemSelectFilter = useAppSelector(selectItemSelectFilter);
    const { t } = useTranslation();
    const isLightMode = useIsLightMode();

    const isPerkAvailableForItemType = (perk: Perk, itemType: ItemType) => {
        if (itemType !== ItemType.Weapon && !isArmourType(itemType)) {
            return false;
        }

        return Object.values(itemTypeData(itemType)).some(item => item.perks?.some((p: Perk) => p.name === perk.name));
    };

    const perksAvailable = useMemo(
        () =>
            Object.values(dauntlessBuilderData.perks)
                .filter(perk => isPerkAvailableForItemType(perk, itemType))
                .sort((a, b) => a.name.localeCompare(b.name)),
        [itemType],
    );

    const filter = isLightMode ? "invert(100%)" : undefined;

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.perks") })}</InputLabel>
            <Select
                multiple
                onChange={ev => dispatch(setPerkFilter([itemType, ev.target.value as string[]]))}
                renderValue={(selected: string[]) => (
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        {selected.map((perkName, index) => {
                            const perk = findPerkByName(perkName);
                            return (
                                <Stack
                                    key={index}
                                    component="span"
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ alignItems: "center", display: "flex" }}
                                >
                                    <img
                                        src={`/assets/icons/perks/${perk?.type}.png`}
                                        style={{ filter, height: "16px", width: "16px" }}
                                    />
                                    <Box component="span">
                                        {t(itemTranslationIdentifier(ItemType.Perk, perkName, "name"))}
                                        {index !== selected.length - 1 ? ", " : ""}
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
                value={itemSelectFilter[itemType as GenericItemType].perks}
                variant="standard"
            >
                {perksAvailable.map(perk => (
                    <MenuItem
                        key={perk.name}
                        value={perk.name}
                    >
                        <ListItemIcon>
                            <img
                                src={`/assets/icons/perks/${perk.type}.png`}
                                style={{ filter, height: "16px", width: "16px" }}
                            />
                        </ListItemIcon>

                        <ListItemText>{t(itemTranslationIdentifier(ItemType.Perk, perk.name, "name"))}</ListItemText>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default React.memo(PerkFilter);
