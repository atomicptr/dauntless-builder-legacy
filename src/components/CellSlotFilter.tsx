import { Box, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Stack } from "@mui/material";
import { CellType } from "@src/data/Cell";
import { ItemType } from "@src/data/ItemType";
import useIsLightMode from "@src/hooks/light-mode";
import { itemSelectFilterAtom, ItemSelectFilterState, setCellSlotsFilter } from "@src/state/item-select-filter";
import { useAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";

interface CellSlotFilterProps {
    itemType: ItemType;
}

const CellSlotFilter: React.FC<CellSlotFilterProps> = ({ itemType }) => {
    const [itemSelectFilter, setItemSelectFilter] = useAtom(itemSelectFilterAtom);
    const { t } = useTranslation();
    const isLightMode = useIsLightMode();

    const filter = isLightMode ? "invert(100%)" : undefined;

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.cell-slot") })}</InputLabel>
            <Select
                multiple
                onChange={ev => setItemSelectFilter(setCellSlotsFilter(itemType, ev.target.value as CellType[]))}
                renderValue={selected => (
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        {selected.map((cellType, index) => {
                            return (
                                <Stack
                                    key={index}
                                    component="span"
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ alignItems: "center", display: "flex" }}
                                >
                                    <img
                                        src={`/assets/icons/perks/${cellType}.png`}
                                        style={{ filter, height: "16px", width: "16px" }}
                                    />
                                    <Box component="span">
                                        {t(`terms.cell-type.${cellType}`)}
                                        {index !== selected.length - 1 ? ", " : ""}
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
                value={itemSelectFilter[itemType as keyof ItemSelectFilterState].cellSlots}
                variant="standard"
            >
                {Object.keys(CellType)
                    .sort()
                    .map(cellType => (
                        <MenuItem
                            key={cellType}
                            value={cellType}
                        >
                            <ListItemIcon>
                                <img
                                    src={`/assets/icons/perks/${cellType}.png`}
                                    style={{ filter, height: "16px", width: "16px" }}
                                />
                            </ListItemIcon>

                            <ListItemText>{t(`terms.cell-type.${cellType}`)}</ListItemText>
                        </MenuItem>
                    ))}
            </Select>
        </FormControl>
    );
};

export default React.memo(CellSlotFilter);
