import { ArmourItemType, ItemType } from "@src/data/ItemType";
import { upgradeBuild } from "@src/data/upgrade-build";
import { validateBuild } from "@src/data/validate-build";
import Hashids from "hashids";
import { match } from "ts-pattern";

import { Armour } from "./Armour";
import { Cell, CellType } from "./Cell";
import dauntlessBuilderData from "./Data";
import { Lantern } from "./Lantern";
import dauntlessBuilderNamesMap, { NamesMapType } from "./NamesMap";
import { Omnicell } from "./Omnicell";
import { Part, PartType } from "./Part";
import { Perk } from "./Perks";
import { Weapon, WeaponType } from "./Weapon";

export const HASHIDS_SALT = "spicy";
export const CURRENT_BUILD_ID = 6;

const hashids = new Hashids(HASHIDS_SALT);

export enum BuildFlags {
    UpgradedBuild = 0b0001,
    InvalidBuild = 0b0010,
}

enum BuildFields {
    Version,
    Flags,
    WeaponName,
    WeaponSurged,
    WeaponCell1,
    WeaponCell2,
    WeaponPart1,
    WeaponPart2,
    WeaponPart3,
    BondWeapon,
    HeadName,
    HeadSurged,
    HeadCell,
    TorsoName,
    TorsoSurged,
    TorsoCell,
    ArmsName,
    ArmsSurged,
    ArmsCell,
    LegsName,
    LegsSurged,
    LegsCell,
    Lantern,
    LanternCell,
    Omnicell,
}

export class BuildModel {
    public version: number = CURRENT_BUILD_ID;
    public flags = 0;
    public weaponName: string | null = null;
    public weaponSurged = true;
    public weaponPart1: string | null = null;
    public weaponPart2: string | null = null;
    public weaponPart3: string | null = null;
    public bondWeapon: string | null = null;
    public weaponCell1: string | null = null;
    public weaponCell2: string | null = null;
    public torsoName: string | null = null;
    public torsoSurged = true;
    public torsoCell: string | null = null;
    public armsName: string | null = null;
    public armsSurged = true;
    public armsCell: string | null = null;
    public legsName: string | null = null;
    public legsSurged = true;
    public legsCell: string | null = null;
    public headName: string | null = null;
    public headSurged = true;
    public headCell: string | null = null;
    public lantern: string | null = null;
    public lanternCell: string | null = null;
    public omnicell: string | null = null;

    get data() {
        return {
            arms: this.armsName !== null ? findArmourByName(this.armsName) : null,
            bondWeapon: this.bondWeapon !== null ? findWeaponByName(this.bondWeapon) : null,
            head: this.headName !== null ? findArmourByName(this.headName) : null,
            lantern: this.lantern !== null ? findLanternByName(this.lantern) : null,
            legs: this.legsName !== null ? findArmourByName(this.legsName) : null,
            omnicell: this.omnicell !== null ? findOmnicellByName(this.omnicell) : null,
            parts: this.partData,
            torso: this.torsoName !== null ? findArmourByName(this.torsoName) : null,
            weapon: this.weaponName !== null ? findWeaponByName(this.weaponName) : null,
        };
    }

    private get partData() {
        if (this.weaponName === null) {
            return null;
        }

        const weapon = findWeaponByName(this.weaponName);

        if (weapon === null) {
            return null;
        }

        if (weapon.type === WeaponType.Repeater) {
            return {
                chamber: findPartInBuild(weapon.type, PartType.Chamber, this),
                grip: findPartInBuild(weapon.type, PartType.Grip, this),
                mod: findPartInBuild(weapon.type, PartType.Mod, this),
            };
        }

        return {
            mod: findPartInBuild(weapon.type, PartType.Mod, this),
            special: findPartInBuild(weapon.type, PartType.Special, this),
        };
    }

    public hasFlag(flag: BuildFlags): boolean {
        return (this.flags & flag) >= 1;
    }

    public addFlag(flag: BuildFlags) {
        this.flags |= flag;
    }

    public removeFlag(flag: BuildFlags) {
        if (!this.hasFlag(flag)) {
            return;
        }
        this.flags ^= flag;
    }

    public serialize() {
        const weapon = this.weaponName !== null ? findWeaponByName(this.weaponName) : null;
        const weaponType = weapon !== null ? partTypeByWeaponType(weapon.type) : null;

        const params = [
            this.version,
            this.flags,
            weapon !== null ? mapIdByName(NamesMapType.Weapon, weapon.name) : 0,
            weapon !== null && this.weaponSurged ? 1 : 0,
            weapon !== null && this.weaponCell1 !== null ? mapIdByName(NamesMapType.Cell, this.weaponCell1) : 0,
            weapon !== null && this.weaponCell2 !== null ? mapIdByName(NamesMapType.Cell, this.weaponCell2) : 0,
            weaponType !== null && this.weaponPart1 !== null ? mapIdByName(weaponType, this.weaponPart1) : 0,
            weaponType !== null && this.weaponPart2 !== null ? mapIdByName(weaponType, this.weaponPart2) : 0,
            weaponType !== null && this.weaponPart3 !== null ? mapIdByName(weaponType, this.weaponPart3) : 0,
            weapon !== null && this.bondWeapon !== null ? mapIdByName(NamesMapType.Weapon, this.bondWeapon) : 0,
            this.headName !== null ? mapIdByName(NamesMapType.Armour, this.headName) : 0,
            this.headSurged ? 1 : 0,
            this.headCell !== null ? mapIdByName(NamesMapType.Cell, this.headCell) : 0,
            this.torsoName !== null ? mapIdByName(NamesMapType.Armour, this.torsoName) : 0,
            this.torsoSurged ? 1 : 0,
            this.torsoCell !== null ? mapIdByName(NamesMapType.Cell, this.torsoCell) : 0,
            this.armsName !== null ? mapIdByName(NamesMapType.Armour, this.armsName) : 0,
            this.armsSurged ? 1 : 0,
            this.armsCell !== null ? mapIdByName(NamesMapType.Cell, this.armsCell) : 0,
            this.legsName !== null ? mapIdByName(NamesMapType.Armour, this.legsName) : 0,
            this.legsSurged ? 1 : 0,
            this.legsCell !== null ? mapIdByName(NamesMapType.Cell, this.legsCell) : 0,
            this.lantern !== null ? mapIdByName(NamesMapType.Lantern, this.lantern) : 0,
            this.lanternCell !== null ? mapIdByName(NamesMapType.Cell, this.lanternCell) : 0,
            this.omnicell !== null ? mapIdByName(NamesMapType.Omnicell, this.omnicell) : 0,
        ];

        return hashids.encode(...params);
    }

    public static deserialize(buildId: string): BuildModel {
        const data = hashids.decode(buildId) as number[];

        const nameById = (type: NamesMapType, id: number): string | null => {
            if (id === 0) {
                return null;
            }

            if (!(type in dauntlessBuilderNamesMap)) {
                return null;
            }

            return dauntlessBuilderNamesMap[type][id];
        };

        const build = new BuildModel();

        build.version = data[BuildFields.Version];
        build.flags = data[BuildFields.Flags];
        build.weaponName = nameById(NamesMapType.Weapon, data[BuildFields.WeaponName]);

        if (build.weaponName !== null) {
            const weapon = findWeaponByName(build.weaponName) as Weapon;
            const weaponPart = partTypeByWeaponType(weapon.type);

            build.weaponSurged = data[BuildFields.WeaponSurged] >= 1;
            build.weaponPart1 = weaponPart ? nameById(weaponPart, data[BuildFields.WeaponPart1]) : null;
            build.weaponPart2 = weaponPart ? nameById(weaponPart, data[BuildFields.WeaponPart2]) : null;
            build.weaponPart3 = weaponPart ? nameById(weaponPart, data[BuildFields.WeaponPart3]) : null;

            build.bondWeapon = nameById(NamesMapType.Weapon, data[BuildFields.BondWeapon]);
            build.weaponCell1 = nameById(NamesMapType.Cell, data[BuildFields.WeaponCell1]);
            build.weaponCell2 = nameById(NamesMapType.Cell, data[BuildFields.WeaponCell2]);
        }

        build.torsoName = nameById(NamesMapType.Armour, data[BuildFields.TorsoName]);
        build.torsoSurged = data[BuildFields.TorsoSurged] >= 1;
        build.torsoCell = nameById(NamesMapType.Cell, data[BuildFields.TorsoCell]);
        build.armsName = nameById(NamesMapType.Armour, data[BuildFields.ArmsName]);
        build.armsSurged = data[BuildFields.ArmsSurged] >= 1;
        build.armsCell = nameById(NamesMapType.Cell, data[BuildFields.ArmsCell]);
        build.legsName = nameById(NamesMapType.Armour, data[BuildFields.LegsName]);
        build.legsSurged = data[BuildFields.LegsSurged] >= 1;
        build.legsCell = nameById(NamesMapType.Cell, data[BuildFields.LegsCell]);
        build.headName = nameById(NamesMapType.Armour, data[BuildFields.HeadName]);
        build.headSurged = data[BuildFields.HeadSurged] >= 1;
        build.headCell = nameById(NamesMapType.Cell, data[BuildFields.HeadCell]);
        build.lantern = nameById(NamesMapType.Lantern, data[BuildFields.Lantern]);
        build.lanternCell = nameById(NamesMapType.Cell, data[BuildFields.LanternCell]);
        build.omnicell = nameById(NamesMapType.Omnicell, data[BuildFields.Omnicell]);

        return build;
    }

    public static tryDeserialize(buildId: string | null): BuildModel {
        if (buildId === null || !BuildModel.isValid(buildId)) {
            return BuildModel.empty();
        }

        buildId = upgradeBuild(buildId);
        const build = BuildModel.deserialize(buildId);

        return validateBuild(build, true);
    }

    public static empty(): BuildModel {
        return new BuildModel();
    }

    public static isValid(buildId: string): boolean {
        const data = hashids.decode(buildId);

        return match(data[BuildFields.Version])
            .with(1, () => false) // v1 is invalid by definition
            .with(2, () => data.length === 31)
            .with(3, () => data.length >= 25 && data.length <= 26)
            .with(4, () => data.length === 26 || data.length === 24) // Patch 1.7.0
            .with(5, () => data.length === 24) // Patch 1.7.3
            .with(6, () => data.length === 25)
            .otherwise(() => false);
    }
}

export const findItem = (itemType: ItemType, name: string): Weapon | Omnicell | Armour | Lantern | Perk | Cell | null =>
    match(itemType)
        .with(ItemType.Weapon, () => findWeaponByName(name))
        .with(ArmourItemType, () => findArmourByName(name))
        .with(ItemType.Lantern, () => findLanternByName(name))
        .with(ItemType.Omnicell, () => findOmnicellByName(name))
        .with(ItemType.Cell, () => findCellByName(name))
        .run();

export const findWeaponByName = (name: string): Weapon | null =>
    name in dauntlessBuilderData.weapons ? dauntlessBuilderData.weapons[name] : null;

export const findOmnicellByName = (name: string): Omnicell | null =>
    name in dauntlessBuilderData.omnicells ? dauntlessBuilderData.omnicells[name] : null;

export const findArmourByName = (name: string): Armour | null =>
    name in dauntlessBuilderData.armours ? dauntlessBuilderData.armours[name] : null;

export const findLanternByName = (name: string): Lantern | null =>
    name in dauntlessBuilderData.lanterns ? dauntlessBuilderData.lanterns[name] : null;

export const findPerkByName = (name: string): Perk | null =>
    name in dauntlessBuilderData.perks ? dauntlessBuilderData.perks[name] : null;

export const findCellByName = (name: string): Cell | null =>
    name in dauntlessBuilderData.cells ? dauntlessBuilderData.cells[name] : null;

export const findPartByName = (weaponType: WeaponType, partType: PartType, name: string): Part | null => {
    // there is probably a better way to do this while making the typescript compiler happy
    return match(weaponType)
        .with(WeaponType.AetherStrikers, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.aetherstrikers.mods[name];
            }

            if (partType === PartType.Special) {
                return dauntlessBuilderData.parts.aetherstrikers.specials[name];
            }

            return null;
        })
        .with(WeaponType.Axe, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.axe.mods[name];
            }

            if (partType === PartType.Special) {
                return dauntlessBuilderData.parts.axe.specials[name];
            }

            return null;
        })
        .with(WeaponType.ChainBlades, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.chainblades.mods[name];
            }

            if (partType === PartType.Special) {
                return dauntlessBuilderData.parts.chainblades.specials[name];
            }

            return null;
        })
        .with(WeaponType.Hammer, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.hammer.mods[name];
            }

            if (partType === PartType.Special) {
                return dauntlessBuilderData.parts.hammer.specials[name];
            }

            return null;
        })
        .with(WeaponType.Repeater, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.repeater.mods[name];
            }

            if (partType === PartType.Chamber) {
                return dauntlessBuilderData.parts.repeater.chambers[name];
            }

            if (partType === PartType.Grip) {
                return dauntlessBuilderData.parts.repeater.grips[name];
            }

            return null;
        })
        .with(WeaponType.Sword, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.sword.mods[name];
            }

            if (partType === PartType.Special) {
                return dauntlessBuilderData.parts.sword.specials[name];
            }

            return null;
        })
        .with(WeaponType.WarPike, () => {
            if (partType === PartType.Mod) {
                return dauntlessBuilderData.parts.warpike.mods[name];
            }

            if (partType === PartType.Special) {
                return dauntlessBuilderData.parts.warpike.specials[name];
            }

            return null;
        })
        .run();
};

export const findPartSlotName = (
    weaponType: WeaponType,
    partType: PartType,
): "weaponPart1" | "weaponPart2" | "weaponPart3" | null => {
    const isRepeater = weaponType === WeaponType.Repeater;
    return match(partType)
        .with(PartType.Mod, () => (isRepeater ? "weaponPart3" : "weaponPart2"))
        .with(PartType.Special, () => (isRepeater ? null : "weaponPart1"))
        .with(PartType.Chamber, () => (isRepeater ? "weaponPart1" : null))
        .with(PartType.Grip, () => (isRepeater ? "weaponPart2" : null))
        .run();
};

export const findPartInBuild = (weaponType: WeaponType, partType: PartType, build: BuildModel): Part | null => {
    const isRepeater = weaponType === WeaponType.Repeater;

    const partName = match(partType)
        .with(PartType.Mod, () => (isRepeater ? build.weaponPart3 : build.weaponPart2))
        .with(PartType.Special, () => (isRepeater ? null : build.weaponPart1))
        .with(PartType.Chamber, () => (isRepeater ? build.weaponPart1 : null))
        .with(PartType.Grip, () => (isRepeater ? build.weaponPart2 : null))
        .run();

    if (partName === null) {
        return null;
    }

    return findPartByName(weaponType, partType, partName);
};

export const findCellByVariantName = (name: string): Cell | null => {
    const cellName = Object.keys(dauntlessBuilderData.cells).find(
        cellName => name in dauntlessBuilderData.cells[cellName].variants,
    );
    if (!cellName || !(cellName in dauntlessBuilderData.cells)) {
        return null;
    }
    return dauntlessBuilderData.cells[cellName];
};

export const mapIdByName = (type: NamesMapType, name: string): number => {
    if (!(type in dauntlessBuilderNamesMap)) {
        return 0;
    }

    const id = Object.keys(dauntlessBuilderNamesMap[type]).find(key => dauntlessBuilderNamesMap[type][key] === name);
    return id ? Number(id) : 0;
};

export const partTypeByWeaponType = (weaponType: WeaponType): NamesMapType =>
    match(weaponType)
        .with(WeaponType.AetherStrikers, () => NamesMapType.AetherstrikerPart)
        .with(WeaponType.Axe, () => NamesMapType.AxePart)
        .with(WeaponType.Hammer, () => NamesMapType.HammerPart)
        .with(WeaponType.ChainBlades, () => NamesMapType.ChainbladesPart)
        .with(WeaponType.Sword, () => NamesMapType.SwordPart)
        .with(WeaponType.Repeater, () => NamesMapType.RepeaterPart)
        .with(WeaponType.WarPike, () => NamesMapType.WarpikePart)
        .exhaustive();

export const doesCellFitIntoSlot = (cellSlot: CellType | null, variantName: string | null): boolean => {
    if (cellSlot === null) {
        return variantName === null;
    }

    if (cellSlot === CellType.Prismatic) {
        return true; // in prismatic slots everything fits
    }

    if (variantName === null) {
        return true; // nothing slotted -> always valid
    }

    const cell = findCellByVariantName(variantName);
    return cell?.slot === cellSlot;
};

export const switchAroundWeaponCellsIfNecessary = (build: BuildModel): BuildModel => {
    const weaponCells = Array.isArray(build.data.weapon?.cells)
        ? build.data.weapon?.cells ?? []
        : [build.data.weapon?.cells ?? null];

    if (build.weaponCell1 !== null && !doesCellFitIntoSlot(weaponCells[0], build.weaponCell1)) {
        if (doesCellFitIntoSlot(weaponCells[1], build.weaponCell1)) {
            if (build.weaponCell2 === null || !doesCellFitIntoSlot(weaponCells[1], build.weaponCell2)) {
                const temp = build.weaponCell2;
                build.weaponCell2 = build.weaponCell1;
                build.weaponCell1 = doesCellFitIntoSlot(weaponCells[0], temp) ? temp : null;
            }
        } else {
            build.weaponCell1 = null;
        }
    }

    if (build.weaponCell2 !== null && !doesCellFitIntoSlot(weaponCells[1], build.weaponCell2)) {
        if (doesCellFitIntoSlot(weaponCells[0], build.weaponCell2)) {
            if (build.weaponCell1 === null || !doesCellFitIntoSlot(weaponCells[0], build.weaponCell1)) {
                const temp = build.weaponCell1;
                build.weaponCell1 = build.weaponCell2;
                build.weaponCell2 = doesCellFitIntoSlot(weaponCells[1], temp) ? temp : null;
            }
        } else {
            build.weaponCell2 = null;
        }
    }

    return build;
};
