import { BuildModel } from "@src/data/BuildModel";
import { ItemRarity } from "@src/data/ItemRarity";

export const validateBondWeapon = (build: BuildModel, _markBuildInvalidOnFailure = false): BuildModel => {
    if (!build.data.weapon?.bond) {
        build.bondWeapon = null;
    }

    if (
        build.data.weapon?.bond &&
        build.data.bondWeapon !== null &&
        build.data.weapon.type !== build.data.bondWeapon.type
    ) {
        build.bondWeapon = null;
    }

    if (
        build.data.weapon?.bond &&
        build.data.bondWeapon !== null &&
        build.data.weapon.bond.elemental !== build.data.bondWeapon.elemental
    ) {
        build.bondWeapon = null;
    }

    if (
        build.data.weapon?.bond &&
        build.data.bondWeapon !== null &&
        build.data.bondWeapon.rarity == ItemRarity.Exotic
    ) {
        build.bondWeapon = null;
    }

    return build;
};
