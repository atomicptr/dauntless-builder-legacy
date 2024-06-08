import { Armour } from "@src/data/Armour";
import { findArmourByName, findWeaponByName, mapIdByName } from "@src/data/BuildModel";
import { ItemType } from "@src/data/ItemType";
import dauntlessBuilderNamesMap, { NamesMapType } from "@src/data/NamesMap";
import { Weapon, WeaponType } from "@src/data/Weapon";
import { buildIdsDecode, buildIdsEncode } from "@src/utils/build-id";
import sortObjectByKeys from "@src/utils/sort-object-by-keys";
import { atom } from "jotai";
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

export const finderAtom = atom<BuildFinderSelectionState>({
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

export const finderConfigView = atom(get => {
    const finder = get(finderAtom);

    const perks = [];

    for (const [perkName, value] of Object.entries(finder.selectedPerks)) {
        const perkId = mapIdByName(NamesMapType.Perks, perkName);

        perks.push(perkId);

        if (value === 6) {
            perks.push(perkId);
        }
    }

    return buildIdsEncode([
        1,
        finder.removeExotics ? 1 : 0,
        finder.removeLegendary ? 1 : 0,
        finder.pickerWeapon !== null ? mapIdByName(NamesMapType.Weapon, finder.pickerWeapon.name) : 0,
        finder.pickerHead !== null ? mapIdByName(NamesMapType.Armour, finder.pickerHead.name) : 0,
        finder.pickerTorso !== null ? mapIdByName(NamesMapType.Armour, finder.pickerTorso.name) : 0,
        finder.pickerArms !== null ? mapIdByName(NamesMapType.Armour, finder.pickerArms.name) : 0,
        finder.pickerLegs !== null ? mapIdByName(NamesMapType.Armour, finder.pickerLegs.name) : 0,
        ...perks,
    ]);
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

export const applyFinderConfigString =
    (finderConfig: string) =>
        (state: BuildFinderSelectionState): BuildFinderSelectionState => {
            const data = buildIdsDecode(finderConfig);

            const config = data.splice(0, 8);
            const perks = data.splice(0, data.length);

            const selectedPerks: { [name: string]: number } = {};

            for (const perkId of perks) {
                const perkName = dauntlessBuilderNamesMap[NamesMapType.Perks][perkId.toString()];

                if (!perkName) {
                    continue;
                }

                if (!(perkName in selectedPerks)) {
                    selectedPerks[perkName] = 0;
                }

                selectedPerks[perkName] += 3;
            }

            const findOrNull = (type: NamesMapType, index: number): Weapon | Armour | null => {
                if (!(config[index] in dauntlessBuilderNamesMap[type])) {
                    return null;
                }

                if (type == NamesMapType.Weapon) {
                    return findWeaponByName(dauntlessBuilderNamesMap[type][config[index]]);
                }

                return findArmourByName(dauntlessBuilderNamesMap[type][config[index]]);
            };

            return {
                ...state,
                pickerArms: findOrNull(NamesMapType.Armour, 6) as Armour | null,
                pickerHead: findOrNull(NamesMapType.Armour, 4) as Armour | null,
                pickerLegs: findOrNull(NamesMapType.Armour, 7) as Armour | null,
                pickerTorso: findOrNull(NamesMapType.Armour, 5) as Armour | null,
                pickerWeapon: findOrNull(NamesMapType.Weapon, 3) as Weapon | null,
                removeExotics: config[1] === 1,
                removeLegendary: config[2] === 1,
                selectedPerks,
            };
        };
