import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BuildModel } from "@src/data/BuildModel";
import { RootState } from "@src/store";
import { match } from "ts-pattern";

interface BuildState {
    build: string;
}

interface BuildUpdate {
    [field: string]: string | boolean | null;
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
        updateBuild: (state, action: PayloadAction<BuildUpdate>) => {
            const build = BuildModel.deserialize(state.build);
            for (const key of Object.keys(action.payload)) {
                const value = action.payload[key];
                console.log(key, value, key in build);
                if (key in build) {
                    match(key)
                        .with("weaponName", () => (build.weaponName = value as string | null))
                        .with("weaponSurged", () => (build.weaponSurged = value as boolean))
                        .with("weaponPart1", () => (build.weaponPart1 = value as string | null))
                        .with("weaponPart2", () => (build.weaponPart2 = value as string | null))
                        .with("weaponPart3", () => (build.weaponPart3 = value as string | null))
                        .with("bondWeapon", () => (build.bondWeapon = value as string | null))
                        .with("weaponCell1", () => (build.weaponCell1 = value as string | null))
                        .with("weaponCell2", () => (build.weaponCell2 = value as string | null))
                        .with("torsoName", () => (build.torsoName = value as string | null))
                        .with("torsoSurged", () => (build.torsoSurged = value as boolean))
                        .with("torsoCell", () => (build.torsoCell = value as string | null))
                        .with("armsName", () => (build.armsName = value as string | null))
                        .with("armsSurged", () => (build.armsSurged = value as boolean))
                        .with("armsCell", () => (build.armsCell = value as string | null))
                        .with("legsName", () => (build.legsName = value as string | null))
                        .with("legsSurged", () => (build.legsSurged = value as boolean))
                        .with("legsCell", () => (build.legsCell = value as string | null))
                        .with("headName", () => (build.headName = value as string | null))
                        .with("headSurged", () => (build.headSurged = value as boolean))
                        .with("headCell", () => (build.headCell = value as string | null))
                        .with("lantern", () => (build.lantern = value as string | null))
                        .with("lanternCell", () => (build.lanternCell = value as string | null))
                        .with("omnicell", () => (build.omnicell = value as string | null))
                        .run();
                }
            }
            console.log(build);
            state.build = build.serialize();
        },
    },
});

export const { clearBuild, setBuildId, updateBuild } = buildSlice.actions;

export const selectBuild = (state: RootState): BuildModel => BuildModel.deserialize(state.build.build);

export default buildSlice.reducer;
