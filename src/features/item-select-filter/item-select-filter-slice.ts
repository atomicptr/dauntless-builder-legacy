import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CellType } from "@src/data/Cell";
import { ElementalType } from "@src/data/ElementalType";
import { ItemType } from "@src/data/ItemType";
import { WeaponType } from "@src/data/Weapon";
import { RootState } from "@src/store";

interface WeaponFilter extends GenericItemFilter {
    weaponTypes: WeaponType[];
}

type ArmourFilter = GenericItemFilter;

interface GenericItemFilter {
    elementTypes: ElementalType[];
    perks: string[];
    cellSlots: CellType[];
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
        cellSlots: [],
        elementTypes: [],
        perks: [],
        weaponTypes: [],
    },
    [ItemType.Head]: {
        cellSlots: [],
        elementTypes: [],
        perks: [],
    },
    [ItemType.Torso]: {
        cellSlots: [],
        elementTypes: [],
        perks: [],
    },
    [ItemType.Arms]: {
        cellSlots: [],
        elementTypes: [],
        perks: [],
    },
    [ItemType.Legs]: {
        cellSlots: [],
        elementTypes: [],
        perks: [],
    },
};

export type GenericItemType = ItemType.Weapon | ItemType.Head | ItemType.Torso | ItemType.Arms | ItemType.Legs;

export const buildSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        resetFilter: state => {
            state[ItemType.Weapon] = initialState[ItemType.Weapon];
        },
        setCellSlotsFilter: (state, action: PayloadAction<[ItemType, CellType[]]>) => {
            const [itemType, cellSlots] = action.payload;
            if (itemType in state) {
                state[itemType as GenericItemType].cellSlots = cellSlots;
            }
        },
        setElementFilter: (state, action: PayloadAction<[ItemType, ElementalType[]]>) => {
            const [itemType, elementalType] = action.payload;
            if (itemType in state) {
                state[itemType as GenericItemType].elementTypes = elementalType;
            }
        },
        setPerkFilter: (state, action: PayloadAction<[ItemType, string[]]>) => {
            const [itemType, perks] = action.payload;
            if (itemType in state) {
                state[itemType as GenericItemType].perks = perks;
            }
        },
        setWeaponTypeFilter: (state, action: PayloadAction<WeaponType[]>) => {
            state[ItemType.Weapon].weaponTypes = action.payload;
        },
    },
});

const initState = (state: ItemSelectFilterState) => Object.assign({}, initialState, state);

export const { resetFilter, setWeaponTypeFilter, setPerkFilter, setCellSlotsFilter, setElementFilter } =
    buildSlice.actions;

export const selectWeaponFilter = (state: RootState): WeaponFilter =>
    initState(state.itemSelectFilter)[ItemType.Weapon];

export const selectItemSelectFilter = (state: RootState): ItemSelectFilterState => initState(state.itemSelectFilter);

export const selectFilterCount = (state: RootState): number =>
    Object.values(initState(state.itemSelectFilter))
        .map(itemTypeFilters =>
            Object.values(itemTypeFilters)
                .map(filters => (Array.isArray(filters) ? filters.length : filters !== null ? 1 : 0))
                .reduce((prev, cur) => prev + cur, 0),
        )
        .reduce((prev, cur) => prev + cur, 0);

export default buildSlice.reducer;
