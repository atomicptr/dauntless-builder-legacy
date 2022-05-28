import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { BuildModel } from "../../data/BuildModel";
import { RootState } from "../../store";

interface BuildState {
    build: string;
}

const initialState: BuildState = {
    build: BuildModel.empty().serialize(),
};

export const buildSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        clearBuild: state => {
            state.build = BuildModel.empty().serialize();
        },
        setBuildId: (state, action: PayloadAction<string>) => {
            state.build = action.payload;
        },
    },
});

export const { clearBuild, setBuildId } = buildSlice.actions;

export const selectBuild = (state: RootState): BuildModel => BuildModel.deserialize(state.build.build);

export default buildSlice.reducer;
