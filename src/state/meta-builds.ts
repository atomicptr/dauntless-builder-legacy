import { WeaponType } from "@src/data/Weapon";
import { atom } from "jotai";

export interface MetaBuildsSelectionState {
    weaponType: WeaponType;
    buildCategoryIndex: number;
    showNote: boolean;
}

export const metaBuildsAtom = atom<MetaBuildsSelectionState>({
    buildCategoryIndex: 0,
    showNote: true,
    weaponType: WeaponType.Sword,
});

export const removeNote =
    () =>
        (state: MetaBuildsSelectionState): MetaBuildsSelectionState => ({
            ...state,
            showNote: false,
        });

export const setBuildCategoryIndex =
    (buildCategoryIndex: number) =>
        (state: MetaBuildsSelectionState): MetaBuildsSelectionState => ({
            ...state,
            buildCategoryIndex,
        });

export const setMetaBuildsWeaponType =
    (weaponType: WeaponType) =>
        (state: MetaBuildsSelectionState): MetaBuildsSelectionState => ({
            ...state,
            weaponType,
        });
