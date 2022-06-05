import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ElementalType } from "@src/data/ElementalType";
import { ItemType } from "@src/data/ItemType";
import { WeaponType } from "@src/data/Weapon";
import { RootState } from "@src/store";

interface WeaponFilter {
    weaponType: WeaponType[];
    elementType: ElementalType[];
}

interface ArmourFilter {
    elementType: ElementalType[];
}

interface ItemSelectFilterState {
    [ItemType.Weapon]: WeaponFilter;
    [ItemType.Head]: ArmourFilter;
    [ItemType.Torso]: ArmourFilter;
    [ItemType.Arms]: ArmourFilter;
    [ItemType.Legs]: ArmourFilter;
}

const initialState: ItemSelectFilterState = {
    [ItemType.Weapon]: {
        elementType: [],
        weaponType: [],
    },
    [ItemType.Head]: {
        elementType: [],
    },
    [ItemType.Torso]: {
        elementType: [],
    },
    [ItemType.Arms]: {
        elementType: [],
    },
    [ItemType.Legs]: {
        elementType: [],
    },
};

export type ElementFilterItemTypes = ItemType.Weapon | ItemType.Head | ItemType.Torso | ItemType.Arms | ItemType.Legs;

export const buildSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        resetFilter: state => {
            state[ItemType.Weapon] = initialState[ItemType.Weapon];
        },
        setElementFilter: (state, action: PayloadAction<[ItemType, ElementalType[]]>) => {
            const [itemType, elementalType] = action.payload;
            if (itemType in state) {
                state[itemType as ElementFilterItemTypes].elementType = elementalType;
            }
        },
        setWeaponTypeFilter: (state, action: PayloadAction<WeaponType[]>) => {
            state[ItemType.Weapon].weaponType = action.payload;
        },
    },
});

export const { resetFilter, setWeaponTypeFilter, setElementFilter } = buildSlice.actions;

export const selectWeaponFilter = (state: RootState): WeaponFilter => state.itemSelectFilter[ItemType.Weapon];

export const selectItemSelectFilter = (state: RootState): ItemSelectFilterState => state.itemSelectFilter;

export default buildSlice.reducer;
