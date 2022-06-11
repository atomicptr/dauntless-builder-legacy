import {BuildModel, findCellByVariantName} from "@src/data/BuildModel";
import {CellType} from "@src/data/Cell";
import {markBuildInvalid} from "@src/data/validate-build";

export const validateDoCellSlotsFitInTheirSlots  = (build: BuildModel, markBuildInvalidOnFailure: boolean): BuildModel => {
    const isCellSlotValid = (cellSlot: CellType|null, variantName: string|null): boolean => {
        console.log("Step 1", cellSlot, variantName);
        if (cellSlot === null) {
            return variantName === null;
        }

        if (variantName === null) {
            return true; // nothing slotted -> always valid
        }

        const cell = findCellByVariantName(variantName);
        console.log("Step 2", cell, "Slot is Prismatic?", cell?.slot === CellType.Prismatic, "Cell slot fits?", cell?.slot === cellSlot);
        return cellSlot=== CellType.Prismatic || cell?.slot === cellSlot;
    }

    const weaponCells = Array.isArray(build.data.weapon?.cells) ?
        build.data.weapon?.cells ?? [] :
        [build.data.weapon?.cells ?? null];

    if (build.data.weapon !== null && !isCellSlotValid(weaponCells[0] as CellType|null, build.weaponCell1)) {
        build.weaponCell1 = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.weapon !== null && !isCellSlotValid(weaponCells[1] as CellType|null, build.weaponCell2)) {
        build.weaponCell2 = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.head !== null && !isCellSlotValid(build.data.head?.cells as CellType|null, build.headCell)) {
        build.headCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.torso !== null && !isCellSlotValid(build.data.torso?.cells as CellType|null, build.torsoCell)) {
        build.torsoCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.arms !== null && !isCellSlotValid(build.data.arms?.cells as CellType|null, build.armsCell)) {
        build.armsCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.legs !== null && !isCellSlotValid(build.data.legs?.cells as CellType|null, build.legsCell)) {
        build.legsCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    if (build.data.lantern !== null && !isCellSlotValid(build.data.lantern?.cells as CellType|null, build.lanternCell)) {
        build.lanternCell = null;

        if (markBuildInvalidOnFailure) {
            markBuildInvalid(build);
        }
    }

    return build;
}
