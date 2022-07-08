import { Box, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Stack } from "@mui/material";
import { WeaponType } from "@src/data/Weapon";
import { selectWeaponFilter, setWeaponTypeFilter } from "@src/features/item-select-filter/item-select-filter-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";

const WeaponTypeFilter: React.FC = () => {
    const dispatch = useAppDispatch();
    const weaponFilter = useAppSelector(selectWeaponFilter);
    const { t } = useTranslation();

    const getWeaponTypeKeyByValue = (weaponTypeValue: WeaponType): string =>
        Object.keys(WeaponType)[Object.values(WeaponType).indexOf(weaponTypeValue)];

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.weapon-type") })}</InputLabel>
            <Select
                multiple
                onChange={ev => dispatch(setWeaponTypeFilter(ev.target.value as WeaponType[]))}
                renderValue={selected => (
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        {selected.map((weaponType, index) => (
                            <Stack
                                key={index}
                                component="span"
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: "center", display: "flex" }}
                            >
                                <img
                                    src={`/assets/icons/generic/${getWeaponTypeKeyByValue(weaponType)}.png`}
                                    style={{ height: "16px", width: "16px" }}
                                />
                                <Box component="span">
                                    {t(`terms.weapon-types.${getWeaponTypeKeyByValue(weaponType)}`)}
                                    {index !== selected.length - 1 ? ", " : ""}
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                )}
                value={weaponFilter.weaponTypes}
                variant="standard"
            >
                {Object.keys(WeaponType)
                    .sort()
                    .map(weaponType => (
                        <MenuItem
                            key={weaponType}
                            value={WeaponType[weaponType as keyof typeof WeaponType]}
                        >
                            <ListItemIcon>
                                <img
                                    src={`/assets/icons/generic/${weaponType}.png`}
                                    style={{ height: "16px", width: "16px" }}
                                />
                            </ListItemIcon>

                            <ListItemText>{t(`terms.weapon-types.${weaponType}`)}</ListItemText>
                        </MenuItem>
                    ))}
            </Select>
        </FormControl>
    );
};

export default WeaponTypeFilter;
