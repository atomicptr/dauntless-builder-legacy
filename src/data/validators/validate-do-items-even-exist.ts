import {
    BuildModel,
    findArmourByName, findCellByVariantName,
    findLanternByName,
    findOmnicellByName, findPartByName,
    findWeaponByName
} from "@src/data/BuildModel";
import {markBuildInvalid} from "@src/data/validate-build";
import {Weapon} from "@src/data/Weapon";

export const validateDoItemsEvenExist = (build: BuildModel, markBuildInvalidOnFailure: boolean): BuildModel => {
    if (build.weaponName !== null) {
        const weapon = findWeaponByName(build.weaponName);
        build.weaponName = weapon?.name ?? null;

        if (weapon === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.weaponCell1 !== null) {
        const cell = findCellByVariantName(build.weaponCell1);
        build.weaponCell1 = cell === null ? null : build.weaponCell1;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.weaponCell2 !== null) {
        const cell = findCellByVariantName(build.weaponCell2);
        build.weaponCell2 = cell === null ? null : build.weaponCell2;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    // TODO: validate parts

    if (build.bondWeapon !== null) {
        const bondWeapon = findWeaponByName(build.bondWeapon);
        build.bondWeapon = bondWeapon?.name ?? null;

        if (bondWeapon === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.headName !== null) {
        const head = findArmourByName(build.headName);
        build.headName = head?.name ?? null;

        if (head === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.headCell !== null) {
        const cell = findCellByVariantName(build.headCell);
        build.headCell = cell === null ? null : build.headCell;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.torsoName !== null) {
        const torso = findArmourByName(build.torsoName);
        build.torsoName = torso?.name ?? null;

        if (torso === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.torsoCell !== null) {
        const cell = findCellByVariantName(build.torsoCell);
        build.torsoCell = cell === null ? null : build.torsoCell;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.armsName !== null) {
        const arms = findArmourByName(build.armsName);
        build.armsName = arms?.name ?? null;

        if (arms === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.armsCell !== null) {
        const cell = findCellByVariantName(build.armsCell);
        build.armsCell = cell === null ? null : build.armsCell;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.legsName !== null) {
        const legs = findArmourByName(build.legsName);
        build.legsName = legs?.name ?? null;

        if (legs === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.legsCell !== null) {
        const cell = findCellByVariantName(build.legsCell);
        build.legsCell = cell === null ? null : build.legsCell;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.lantern !== null) {
        const lantern = findLanternByName(build.lantern);
        build.lantern = lantern?.name ?? null;

        if (lantern === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.lanternCell !== null) {
        const cell = findCellByVariantName(build.lanternCell);
        build.lanternCell = cell === null ? null : build.lanternCell;

        if (cell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.omnicell !== null) {
        const omnicell = findOmnicellByName(build.omnicell);
        build.omnicell = omnicell?.name ?? null;

        if (omnicell === null && markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    return build;
}
