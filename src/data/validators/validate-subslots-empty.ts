import { BuildModel } from "@src/data/BuildModel";

export const validateSubslotsEmpty = (build: BuildModel, _markBuildInvalidOnFailure = false): BuildModel => {
    if (build.weaponName === null) {
        build.weaponSurged = false;
        build.weaponCell1 = null;
        build.weaponCell2 = null;
        build.weaponPart1 = null;
        build.weaponPart2 = null;
        build.weaponPart3 = null;
        build.bondWeapon = null;
    }

    if (build.headName === null) {
        build.headSurged = false;
        build.headCell = null;
    }

    if (build.torsoName === null) {
        build.torsoSurged = false;
        build.torsoCell = null;
    }

    if (build.armsName === null) {
        build.armsSurged = false;
        build.armsCell = null;
    }

    if (build.legsName === null) {
        build.legsSurged = false;
        build.legsCell = null;
    }

    if (build.lantern === null) {
        build.lanternCell = null;
    }

    return build;
};
