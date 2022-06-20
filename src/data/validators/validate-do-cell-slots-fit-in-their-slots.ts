import {BuildModel, findCellByVariantName, doesCellFitIntoSlot} from "@src/data/BuildModel";
import {CellType} from "@src/data/Cell";
import {markBuildInvalid} from "@src/data/validate-build";

export const validateDoCellSlotsFitInTheirSlots  = (build: BuildModel, markBuildInvalidOnFailure: boolean): BuildModel => {
    const weaponCells = Array.isArray(build.data.weapon?.cells) ?
        build.data.weapon?.cells ?? [] :
        [build.data.weapon?.cells ?? null];

    if (build.data.weapon !== null && !doesCellFitIntoSlot(weaponCells[0] as CellType|null, build.weaponCell1)) {
        build.weaponCell1 = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.weapon !== null && !doesCellFitIntoSlot(weaponCells[1] as CellType|null, build.weaponCell2)) {
        build.weaponCell2 = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.head !== null && !doesCellFitIntoSlot(build.data.head?.cells as CellType|null, build.headCell)) {
        build.headCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.torso !== null && !doesCellFitIntoSlot(build.data.torso?.cells as CellType|null, build.torsoCell)) {
        build.torsoCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.arms !== null && !doesCellFitIntoSlot(build.data.arms?.cells as CellType|null, build.armsCell)) {
        build.armsCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.legs !== null && !doesCellFitIntoSlot(build.data.legs?.cells as CellType|null, build.legsCell)) {
        build.legsCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.lantern !== null && !doesCellFitIntoSlot(build.data.lantern?.cells as CellType|null, build.lanternCell)) {
        build.lanternCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    return build;
}
