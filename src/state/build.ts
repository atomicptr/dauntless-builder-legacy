import { BuildModel, CURRENT_BUILD_ID, switchAroundWeaponCellsIfNecessary } from "@src/data/BuildModel";
import { validateBuild } from "@src/data/validate-build";
import log from "@src/utils/logger";
import { atom } from "jotai";
import { match } from "ts-pattern";

export interface BuildState {
    build: string;
    lastEditedBuild: string | null;
}

export interface BuildUpdate {
    [field: string]: string | boolean | null;
}

export const buildAtom = atom<BuildState>({
    build: BuildModel.empty().serialize(),
    lastEditedBuild: null,
});

export const buildModelView = atom(get => {
    const buildState = get(buildAtom);
    return BuildModel.deserialize(buildState.build);
});

export const lastSelectedBuildModelView = atom(get => {
    const buildState = get(buildAtom);
    if (!buildState.lastEditedBuild) {
        return null;
    }
    return BuildModel.deserialize(buildState.lastEditedBuild);
});

export const clearBuild = () => (state: BuildState) => ({
    build: BuildModel.empty().serialize(),
    lastEditedBuild: state.lastEditedBuild,
});

export const setBuildId = (buildId: string) => (state: BuildState) => ({
    build: buildId,
    lastEditedBuild: state.lastEditedBuild,
});

export const updateBuild =
    (buildUpdate: BuildUpdate) =>
        (state: BuildState): BuildState => {
            let build = BuildModel.deserialize(state.build);

            // set build id to current and reset flags when editing
            build.version = CURRENT_BUILD_ID;
            build.flags = 0;

            for (const key of Object.keys(buildUpdate)) {
                const value = buildUpdate[key];
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
            build = switchAroundWeaponCellsIfNecessary(build);
            build = validateBuild(build);
            log.debug("Updated Build", { build, changePayload: buildUpdate });

            const buildId = build.serialize();

            return {
                build: buildId,
                lastEditedBuild: buildId,
            };
        };
