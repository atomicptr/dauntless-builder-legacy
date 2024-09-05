import { CellType } from "@src/data/Cell";
import { ElementalType } from "@src/data/ElementalType";
import { ItemType } from "@src/data/ItemType";
import { WeaponType } from "@src/data/Weapon";
import { atom } from "jotai";

export interface WeaponFilter extends GenericItemFilter {
    weaponTypes: WeaponType[];
}

type ArmourFilter = GenericItemFilter;

export interface GenericItemFilter {
    elementTypes: ElementalType[];
    perks: string[];
    cellSlots: CellType[];
}

export interface ItemSelectFilterState {
    [ItemType.Weapon]: WeaponFilter;
    [ItemType.Head]: ArmourFilter;
    [ItemType.Torso]: ArmourFilter;
    [ItemType.Arms]: ArmourFilter;
    [ItemType.Legs]: ArmourFilter;
}

const initialState = {
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

export const itemSelectFilterAtom = atom<ItemSelectFilterState>(initialState);

export const weaponFilterView = atom<WeaponFilter>(get => get(itemSelectFilterAtom)[ItemType.Weapon]);

export const filterCountView = atom<number>(get =>
    Object.values(get(itemSelectFilterAtom))
        .map(itemTypeFilters =>
            Object.values(itemTypeFilters)
                .map(filters => (Array.isArray(filters) ? filters.length : filters !== null ? 1 : 0))
                .reduce((prev, cur) => prev + cur, 0),
        )
        .reduce((prev, cur) => prev + cur, 0),
);

export const resetFilter =
    () =>
        (state: ItemSelectFilterState): ItemSelectFilterState => ({
            ...state,
            [ItemType.Weapon]: initialState[ItemType.Weapon],
        });

export const setWeaponTypeFilter =
    (weaponTypes: WeaponType[]) =>
        (state: ItemSelectFilterState): ItemSelectFilterState => ({
            ...state,
            [ItemType.Weapon]: {
                ...state[ItemType.Weapon],
                weaponTypes,
            },
        });

export const setCellSlotsFilter =
    (itemType: ItemType, cellSlots: CellType[]) =>
        (state: ItemSelectFilterState): ItemSelectFilterState => {
            if (!(itemType in state)) {
                return state;
            }

            return {
                ...state,
                [itemType as keyof ItemSelectFilterState]: {
                    ...state[itemType as keyof ItemSelectFilterState],
                    cellSlots: cellSlots,
                },
            };
        };

export const setElementFilter =
    (itemType: ItemType, elementalType: ElementalType[]) =>
        (state: ItemSelectFilterState): ItemSelectFilterState => {
            if (!(itemType in state)) {
                return state;
            }

            return {
                ...state,
                [itemType as keyof ItemSelectFilterState]: {
                    ...state[itemType as keyof ItemSelectFilterState],
                    elementTypes: elementalType,
                },
            };
        };

export const setPerkFilter =
    (itemType: ItemType, perks: string[]) =>
        (state: ItemSelectFilterState): ItemSelectFilterState => {
            if (!(itemType in state)) {
                return state;
            }

            return {
                ...state,
                [itemType as keyof ItemSelectFilterState]: {
                    ...state[itemType as keyof ItemSelectFilterState],
                    perks: perks,
                },
            };
        };
