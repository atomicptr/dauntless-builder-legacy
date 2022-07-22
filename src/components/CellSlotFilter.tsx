import { Box, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Stack } from "@mui/material";
import { CellType } from "@src/data/Cell";
import { ItemType } from "@src/data/ItemType";
import {
    GenericItemType,
    selectItemSelectFilter,
    setCellSlotsFilter,
} from "@src/features/item-select-filter/item-select-filter-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";

interface CellSlotFilterProps {
    itemType: ItemType;
}

const CellSlotFilter: React.FC<CellSlotFilterProps> = ({ itemType }) => {
    const dispatch = useAppDispatch();
    const itemSelectFilter = useAppSelector(selectItemSelectFilter);
    const { t } = useTranslation();

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.cell-slot") })}</InputLabel>
            <Select
                multiple
                onChange={ev => dispatch(setCellSlotsFilter([itemType, ev.target.value as CellType[]]))}
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
                                        style={{ height: "16px", width: "16px" }}
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
                value={itemSelectFilter[itemType as GenericItemType].cellSlots}
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
                                    style={{ height: "16px", width: "16px" }}
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
