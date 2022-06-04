import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ItemType } from "@src/data/ItemType";
import { WeaponType } from "@src/data/Weapon";
import { RootState } from "@src/store";

interface WeaponFilter {
    weaponType: WeaponType | null;
}

interface ItemSelectFilterState {
    [ItemType.Weapon]: WeaponFilter;
}

const initialState: ItemSelectFilterState = {
    [ItemType.Weapon]: {
        weaponType: null,
    },
};

export const buildSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        setWeaponFilterType: (state, action: PayloadAction<WeaponType | null>) => {
            state[ItemType.Weapon].weaponType = action.payload;
        },
    },
});

export const { setWeaponFilterType } = buildSlice.actions;

export const selectWeaponFilter = (state: RootState): WeaponFilter => state.itemSelectFilter[ItemType.Weapon];

export const selectItemSelectFilter = (state: RootState): ItemSelectFilterState => state.itemSelectFilter;

export default buildSlice.reducer;
