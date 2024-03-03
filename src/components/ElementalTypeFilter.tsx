import { Box, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Stack } from "@mui/material";
import { ElementalType } from "@src/data/ElementalType";
import { ItemType } from "@src/data/ItemType";
import { itemSelectFilterAtom, ItemSelectFilterState, setElementFilter } from "@src/state/item-select-filter";
import { assetUrl } from "@src/utils/asset-url";
import { useAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";

interface ElementalTypeFilterProps {
    itemType: ItemType;
}

const ElementalTypeFilter: React.FC<ElementalTypeFilterProps> = ({ itemType }) => {
    const [itemSelectFilter, setItemSelectFilter] = useAtom(itemSelectFilterAtom);
    const { t } = useTranslation();

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.elemental-type") })}</InputLabel>
            <Select
                multiple
                onChange={ev => setItemSelectFilter(setElementFilter(itemType, ev.target.value as ElementalType[]))}
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
                                    src={assetUrl(`/assets/icons/elements/${elementalType}.png`)}
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
                value={itemSelectFilter[itemType as keyof ItemSelectFilterState].elementTypes}
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
                                    src={assetUrl(`/assets/icons/elements/${elementalType}.png`)}
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
