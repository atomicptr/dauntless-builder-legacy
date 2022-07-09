import { Box, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Stack } from "@mui/material";
import { ElementalType } from "@src/data/ElementalType";
import { ItemType } from "@src/data/ItemType";
import {
    GenericItemType,
    selectItemSelectFilter,
    setElementFilter,
} from "@src/features/item-select-filter/item-select-filter-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";

interface ElementalTypeFilterProps {
    itemType: ItemType;
}

const ElementalTypeFilter: React.FC<ElementalTypeFilterProps> = ({ itemType }) => {
    const dispatch = useAppDispatch();
    const itemSelectFilter = useAppSelector(selectItemSelectFilter);
    const { t } = useTranslation();

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.elemental-type") })}</InputLabel>
            <Select
                multiple
                onChange={ev => dispatch(setElementFilter([itemType, ev.target.value as ElementalType[]]))}
                renderValue={selected => (
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        {selected.map((elementalType, index) => (
                            <Stack
                                key={index}
                                component="span"
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: "center", display: "flex" }}
                            >
                                <img
                                    src={`/assets/icons/elements/${elementalType}.png`}
                                    style={{ height: "16px", width: "16px" }}
                                />
                                <Box component="span">
                                    {t(`terms.elemental-types.${elementalType}`)}
                                    {index !== selected.length - 1 ? ", " : ""}
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                )}
                value={itemSelectFilter[itemType as GenericItemType].elementTypes}
                variant="standard"
            >
                {Object.keys(ElementalType)
                    .sort()
                    .map(elementalType => (
                        <MenuItem
                            key={elementalType}
                            value={ElementalType[elementalType as keyof typeof ElementalType]}
                        >
                            <ListItemIcon>
                                <img
                                    src={`/assets/icons/elements/${elementalType}.png`}
                                    style={{ height: "16px", width: "16px" }}
                                />
                            </ListItemIcon>

                            <ListItemText>{t(`terms.elemental-types.${elementalType}`)}</ListItemText>
                        </MenuItem>
                    ))}
            </Select>
        </FormControl>
    );
};

export default React.memo(ElementalTypeFilter);
