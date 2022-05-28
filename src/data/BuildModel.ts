import Hashids from "hashids";

import dauntlessBuilderData from "./Data";
import dauntlessBuilderNamesMap, {NamesMapType} from "./NamesMap";
import {Weapon, WeaponType} from "./Weapon";
import {Omnicell} from "./Omnicell";
import {Armour} from "./Armour";
import {Lantern} from "./Lantern";
import {Perk} from "./Perks";
import {Cell} from "./Cell";

const hashids = new Hashids("spicy");

const CURRENT_BUILD_ID = 6;

export const BuildFlags = {
    INVALID_BUILD: 0b0010,
    UPGRADED_BUILD: 0b0001,
};

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
    public weaponName: string|null = null;
    public weaponSurged: boolean = true;
    public weaponPart1: string|null = null;
    public weaponPart2: string|null = null;
    public weaponPart3: string|null = null;
    public bondWeapon: string|null = null;
    public weaponCell1: string|null = null;
    public weaponCell2: string|null = null;
    public torsoName: string|null = null;
    public torsoSurged: boolean = true;
    public torsoCell: string|null = null;
    public armsName: string|null = null;
    public armsSurged: boolean = true;
    public armsCell: string|null = null;
    public legsName: string|null = null;
    public legsSurged: boolean = true;
    public legsCell: string|null = null;
    public headName: string|null = null;
    public headSurged: boolean = true;
    public headCell: string|null = null;
    public lantern: string|null = null;
    public lanternCell: string|null = null;
    public omnicell: string|null = null;

    get data() {
        return {
            omnicell: this.omnicell !== null ? findOmnicellByName(this.omnicell) : null,
            weapon: this.weaponName !== null ? findWeaponByName(this.weaponName) : null,
            head: this.headName !== null ? findArmourByName(this.headName) : null,
            torso: this.torsoName !== null ? findArmourByName(this.torsoName) : null,
            arms: this.armsName !== null ? findArmourByName(this.armsName) : null,
            legs: this.legsName !== null ? findArmourByName(this.legsName) : null,
            lantern: this.lantern !== null ? findLanternByName(this.lantern) : null,
        };
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

        const nameById = (type: NamesMapType, id: number): string|null => {
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

            build.weaponSurged = data[BuildFields.WeaponSurged] === 1;
            build.weaponPart1 = weaponPart ? nameById(weaponPart, data[BuildFields.WeaponPart1]) : null;
            build.weaponPart2 = weaponPart ? nameById(weaponPart, data[BuildFields.WeaponPart2]) : null;
            build.weaponPart3 = weaponPart ? nameById(weaponPart, data[BuildFields.WeaponPart3]) : null;

            build.bondWeapon = nameById(NamesMapType.Weapon, data[BuildFields.BondWeapon]);
            build.weaponCell1 = nameById(NamesMapType.Cell, data[BuildFields.WeaponCell1]);
            build.weaponCell2 = nameById(NamesMapType.Cell, data[BuildFields.WeaponCell2]);
        }

        build.torsoName = nameById(NamesMapType.Armour, data[BuildFields.TorsoName]);
        build.torsoSurged = data[BuildFields.TorsoSurged] === 1;
        build.torsoCell = nameById(NamesMapType.Cell, data[BuildFields.TorsoCell]);
        build.armsName = nameById(NamesMapType.Armour, data[BuildFields.ArmsName]);
        build.armsSurged = data[BuildFields.ArmsSurged] === 1;
        build.armsCell = nameById(NamesMapType.Cell, data[BuildFields.ArmsCell]);
        build.legsName = nameById(NamesMapType.Armour, data[BuildFields.LegsName]);
        build.legsSurged = data[BuildFields.LegsSurged] === 1;
        build.legsCell = nameById(NamesMapType.Cell, data[BuildFields.LegsCell]);
        build.headName = nameById(NamesMapType.Armour, data[BuildFields.HeadName]);
        build.headSurged = data[BuildFields.HeadSurged] === 1;
        build.headCell = nameById(NamesMapType.Cell, data[BuildFields.HeadCell]);
        build.lantern = nameById(NamesMapType.Lantern, data[BuildFields.Lantern]);
        build.lanternCell = nameById(NamesMapType.Cell, data[BuildFields.LanternCell]);
        build.omnicell = nameById(NamesMapType.Omnicell, data[BuildFields.Omnicell]);

        return build;
    }

    public static tryDeserialize(buildId: string): BuildModel {
        if (BuildModel.isValid(buildId)) {
            return BuildModel.deserialize(buildId);
        }
        return BuildModel.empty();
    }

    public static empty(): BuildModel {
        return new BuildModel();
    }

    public static isValid(buildId: string): boolean {
        const data = hashids.decode(buildId);

        switch (data[BuildFields.Version]) {
            case 6:
                return data.length === 25;
        }

        return false;
    }
}

export const findWeaponByName = (name: string): Weapon|null =>
    name in dauntlessBuilderData.weapons ? dauntlessBuilderData.weapons[name] : null;

export const findOmnicellByName = (name: string): Omnicell|null =>
    name in dauntlessBuilderData.omnicells ? dauntlessBuilderData.omnicells[name] : null;

export const findArmourByName = (name: string): Armour|null =>
    name in dauntlessBuilderData.armours ? dauntlessBuilderData.armours[name] : null;

export const findLanternByName = (name: string): Lantern|null =>
    name in dauntlessBuilderData.lanterns ? dauntlessBuilderData.lanterns[name] : null;

export const findPerkByName = (name: string): Perk|null =>
    name in dauntlessBuilderData.perks ? dauntlessBuilderData.perks[name] : null;

export const findCellByVariantName = (name: string): Cell|null => {
    const cellName = Object.keys(dauntlessBuilderData.cells).find(cellName => name in dauntlessBuilderData.cells[cellName].variants);
    if (!cellName) {
        return null;
    }
    return dauntlessBuilderData.cells[cellName];
}

export const mapIdByName = (type: NamesMapType, name: string): number => {
    if (!(type in dauntlessBuilderNamesMap)) {
        return 0;
    }

    const id = Object.keys(dauntlessBuilderNamesMap[type]).find(key => dauntlessBuilderNamesMap[type][key] === name);
    return id ? Number(id) : 0;
};

export const partTypeByWeaponType = (weaponType: WeaponType): NamesMapType => {
    switch (weaponType) {
        case WeaponType.AetherStrikers:
            return NamesMapType.AetherstrikerPart;
        case WeaponType.Axe:
            return NamesMapType.AxePart;
        case WeaponType.Hammer:
            return NamesMapType.HammerPart;
        case WeaponType.ChainBlades:
            return NamesMapType.ChainbladesPart;
        case WeaponType.Sword:
            return NamesMapType.SwordPart;
        case WeaponType.Repeater:
            return NamesMapType.RepeaterPart;
        case WeaponType.WarPike:
            return NamesMapType.WarpikePart;
    }
};
