import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Armour } from "@src/data/Armour";
import { ItemType } from "@src/data/ItemType";
import { Weapon, WeaponType } from "@src/data/Weapon";
import { RootState } from "@src/store";
import sortObjectByKeys from "@src/utils/sort-object-by-keys";
import { match } from "ts-pattern";

export interface AssignedPerkValue {
    [perkName: string]: number;
}

export interface AddPerkAction {
    perkName: string;
    value: number;
}

interface BuildFinderSelectionState {
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

const initialState: BuildFinderSelectionState = {
    pickerArms: null,
    pickerHead: null,
    pickerLegs: null,
    pickerTorso: null,
    pickerWeapon: null,
    removeExotics: true,
    removeLegendary: true,
    selectedPerks: {},
    weaponType: WeaponType.Sword,
};

export const buildFinderSelectionSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        clearPerks: state => {
            state.selectedPerks = {};
        },
        setBuildFinderWeaponType: (state, action: PayloadAction<WeaponType>) => {
            state.weaponType = action.payload;
        },
        setPerkValue: (state, action: PayloadAction<AddPerkAction>) => {
            state.selectedPerks[action.payload.perkName] = Math.max(Math.min(action.payload.value, 6), 0);

            if (action.payload.value === 0) {
                delete state.selectedPerks[action.payload.perkName];
            }

            state.selectedPerks = sortObjectByKeys(state.selectedPerks);
        },
        setPicker: (state, action: PayloadAction<{ itemType: ItemType; item: Weapon | Armour | null }>) => {
            const { itemType, item } = action.payload;
            match(itemType)
                .with(ItemType.Weapon, () => (state.pickerWeapon = item as Weapon))
                .with(ItemType.Head, () => (state.pickerHead = item as Armour))
                .with(ItemType.Torso, () => (state.pickerTorso = item as Armour))
                .with(ItemType.Arms, () => (state.pickerArms = item as Armour))
                .with(ItemType.Legs, () => (state.pickerLegs = item as Armour))
                .run();
        },
        setRemoveExotics: (state, action: PayloadAction<boolean>) => {
            state.removeExotics = action.payload;
        },
        setRemoveLegendary: (state, action: PayloadAction<boolean>) => {
            state.removeLegendary = action.payload;
        },
    },
});

const initState = (state: BuildFinderSelectionState) => Object.assign({}, initialState, state);

export const { setBuildFinderWeaponType, setPerkValue, clearPerks, setRemoveExotics, setRemoveLegendary, setPicker } =
    buildFinderSelectionSlice.actions;

export const selectBuildFinderSelection = (state: RootState) => initState(state.buildFinderSelection);

export default buildFinderSelectionSlice.reducer;
