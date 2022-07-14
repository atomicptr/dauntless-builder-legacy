import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WeaponType } from "@src/data/Weapon";
import { RootState } from "@src/store";
import sortObjectByKeys from "@src/utils/sort-object-by-keys";

export interface AssignedPerkValue {
    [perkName: string]: number;
}

export interface AddPerkAction {
    perkName: string;
    value: number;
}

interface BuildFinderSelectionState {
    weaponType: WeaponType | null;
    selectedPerks: AssignedPerkValue;
}

const initialState: BuildFinderSelectionState = {
    selectedPerks: {},
    weaponType: null,
};

export const buildFinderSelectionSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        clearPerks: state => {
            state.selectedPerks = {};
        },
        setPerkValue: (state, action: PayloadAction<AddPerkAction>) => {
            state.selectedPerks[action.payload.perkName] = Math.max(Math.min(action.payload.value, 6), 0);

            if (action.payload.value === 0) {
                delete state.selectedPerks[action.payload.perkName];
            }

            state.selectedPerks = sortObjectByKeys(state.selectedPerks);
        },
        setWeaponType: (state, action: PayloadAction<WeaponType>) => {
            state.weaponType = action.payload;
        },
    },
});

export const { setWeaponType, setPerkValue, clearPerks } = buildFinderSelectionSlice.actions;

export const selectBuildFinderSelection = (state: RootState) => state.buildFinderSelection;

export default buildFinderSelectionSlice.reducer;
