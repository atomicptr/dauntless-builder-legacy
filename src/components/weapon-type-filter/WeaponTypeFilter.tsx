import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { WeaponType } from "@src/data/Weapon";
import { selectWeaponFilter, setWeaponTypeFilter } from "@src/features/item-select-filter/item-select-filter-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";

const WeaponTypeFilter: React.FC = () => {
    const dispatch = useAppDispatch();
    const weaponFilter = useAppSelector(selectWeaponFilter);
    const { t } = useTranslation();

    return (
        <FormControl fullWidth>
            <InputLabel>{t("pages.build.filter-by", { name: t("terms.weapon-type") })}</InputLabel>
            <Select
                multiple
                onChange={ev => dispatch(setWeaponTypeFilter(ev.target.value as WeaponType[]))}
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
                            {t(`terms.weapon-types.${weaponType}`)}
                        </MenuItem>
                    ))}
            </Select>
        </FormControl>
    );
};

export default WeaponTypeFilter;
