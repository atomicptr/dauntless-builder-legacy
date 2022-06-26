import { BuildModel, findPartByName, findPartSlotName } from "@src/data/BuildModel";
import { PartType } from "@src/data/Part";
import { WeaponType } from "@src/data/Weapon";

export const validateWepaonParts = (build: BuildModel, _markBuildInvalidOnFailure = false): BuildModel => {
    if (build.data.weapon === null) {
        build.weaponPart1 = null;
        build.weaponPart2 = null;
        build.weaponPart3 = null;
        return build;
    }

    if (build.data.weapon?.type === WeaponType.Repeater) {
        const chamberSlot = findPartSlotName(build.data.weapon.type, PartType.Chamber);
        const gripSlot = findPartSlotName(build.data.weapon.type, PartType.Grip);

        const chamberName = chamberSlot !== null ? build[chamberSlot] : null;
        const gripName = gripSlot !== null ? build[gripSlot] : null;

        if (
            chamberSlot !== null &&
            (chamberName !== null ? findPartByName(build.data.weapon.type, PartType.Chamber, chamberName) : null) ===
                null
        ) {
            build[chamberSlot] = null;
        }

        if (
            gripSlot !== null &&
            (gripName !== null ? findPartByName(build.data.weapon.type, PartType.Grip, gripName) : null) === null
        ) {
            build[gripSlot] = null;
        }
    }

    const specialSlot = findPartSlotName(build.data.weapon.type, PartType.Special);
    const modSlot = findPartSlotName(build.data.weapon.type, PartType.Mod);

    const specialName = specialSlot !== null ? build[specialSlot] : null;
    const modName = modSlot !== null ? build[modSlot] : null;

    if (
        specialSlot !== null &&
        (specialName !== null ? findPartByName(build.data.weapon.type, PartType.Special, specialName) : null) === null
    ) {
        build[specialSlot] = null;
    }

    if (
        modSlot !== null &&
        (modName !== null ? findPartByName(build.data.weapon.type, PartType.Mod, modName) : null) === null
    ) {
        build[modSlot] = null;
    }

    return build;
};
