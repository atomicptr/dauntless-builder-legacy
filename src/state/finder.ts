import { Armour } from "@src/data/Armour";
import { ItemType } from "@src/data/ItemType";
import { Weapon, WeaponType } from "@src/data/Weapon";
import { stateIdent } from "@src/state/common";
import sortObjectByKeys from "@src/utils/sort-object-by-keys";
import { atomWithStorage } from "jotai/utils";
import { match } from "ts-pattern";

export interface AssignedPerkValue {
    [perkName: string]: number;
}

export interface AddPerkAction {
    perkName: string;
    value: number;
}

export interface BuildFinderSelectionState {
    weaponType: WeaponType;
    selectedPerks: AssignedPerkValue;
    removeExotics: boolean;
    removeLegendary: boolean;
    pickerWeapon: Weapon | null;
    pickerHead: Armour | null;
    pickerTorso: Armour | null;
    pickerArms: Armour | null;
    pickerLegs: Armour | null;
}

export const finderAtom = atomWithStorage<BuildFinderSelectionState>(stateIdent("buildFinderSelection"), {
    pickerArms: null,
    pickerHead: null,
    pickerLegs: null,
    pickerTorso: null,
    pickerWeapon: null,
    removeExotics: true,
    removeLegendary: true,
    selectedPerks: {},
    weaponType: WeaponType.Sword,
});

export const clearPerks =
    () =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState => ({
            ...state,
            selectedPerks: {},
        });

export const setBuildFinderWeaponType =
    (weaponType: WeaponType) =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState => ({
            ...state,
            weaponType,
        });

export const setPerkValue =
    (perkAction: AddPerkAction) =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState => {
            let selectedPerks = { ...state.selectedPerks };

            selectedPerks[perkAction.perkName] = Math.max(Math.min(perkAction.value, 6), 0);

            if (perkAction.value === 0) {
                delete selectedPerks[perkAction.perkName];
            }

            selectedPerks = sortObjectByKeys(selectedPerks);

            return {
                ...state,
                selectedPerks,
            };
        };

export const setPicker =
    (itemType: ItemType, item: Weapon | Armour | null) =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState =>
            match(itemType)
                .with(ItemType.Weapon, () => ({ ...state, pickerWeapon: item as Weapon }))
                .with(ItemType.Head, () => ({ ...state, pickerHead: item as Armour }))
                .with(ItemType.Torso, () => ({ ...state, pickerTorso: item as Armour }))
                .with(ItemType.Arms, () => ({ ...state, pickerArms: item as Armour }))
                .with(ItemType.Legs, () => ({ ...state, pickerLegs: item as Armour }))
                .run();

export const setRemoveExotics =
    (removeExotics: boolean) =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState => ({
            ...state,
            removeExotics,
        });

export const setRemoveLegendary =
    (removeLegendary: boolean) =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState => ({
            ...state,
            removeLegendary,
        });
