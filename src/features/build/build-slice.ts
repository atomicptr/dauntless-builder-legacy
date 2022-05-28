import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../store";

interface BuildState {
    build: boolean | null;
}

const initialState: BuildState = {
    build: null,
};

export const buildSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        deleteBuild: state => {
            state.build = null;
        },
        updateBuild: (state, action: PayloadAction<boolean>) => {
            state.build = action.payload;
        },
    },
});

export const { deleteBuild, updateBuild } = buildSlice.actions;

export const selectBuild = (state: RootState) => state.build.build;

export default buildSlice.reducer;
