import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface RecentBuildsState {
    recentBuilds: string[];
}

const initialState: RecentBuildsState = {
    recentBuilds: [],
};

export const recentBuildsSlice = createSlice({
    name: "recentBuilds",
    initialState,
    reducers: {
        deleteBuildById: (state, action: PayloadAction<string>) => {
            state.recentBuilds = state.recentBuilds.filter(build => build !== action.payload);
        },
        addBuild: (state, action: PayloadAction<string>) => {
            state.recentBuilds.push(action.payload);
        },
    },
});

export const { deleteBuildById, addBuild } = recentBuildsSlice.actions;

export const selectRecentBuilds = (state: RootState) => state.recentBuilds.recentBuilds;

export default recentBuildsSlice.reducer;
