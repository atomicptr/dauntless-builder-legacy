import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WeaponType } from "@src/data/Weapon";
import { RootState } from "@src/store";

interface MetaBuildsSelectionState {
    weaponType: WeaponType | null;
    buildCategoryIndex: number;
    showNote: boolean;
}

const initialState: MetaBuildsSelectionState = {
    buildCategoryIndex: 0,
    showNote: true,
    weaponType: null,
};

export const metaBuildsSelectionSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        removeNote: state => {
            state.showNote = false;
        },
        setBuildCategoryIndex: (state, action: PayloadAction<number>) => {
            state.buildCategoryIndex = action.payload;
        },
        setWeaponType: (state, action: PayloadAction<WeaponType>) => {
            state.weaponType = action.payload;
        },
    },
});

export const { setWeaponType, setBuildCategoryIndex, removeNote } = metaBuildsSelectionSlice.actions;

export const selectMetaBuildsSelection = (state: RootState) => state.metaBuildsSelection;

export default metaBuildsSelectionSlice.reducer;
