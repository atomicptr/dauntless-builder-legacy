import Hashids from "hashids";
import DataUtility from "../utility/DataUtility";

const hashids = new Hashids("spicy");

export default class BuildModel {
    constructor(data) {
        // set default parameter values
        this.__version = 2;
        this.weapon_name = "";
        this.weapon_level = 0;
        this.weapon_part1_name = "";
        this.weapon_part1_level = 0;
        this.weapon_part2_name = "";
        this.weapon_part2_level = 0;
        this.weapon_part3_name = "";
        this.weapon_part3_level = 0;
        this.weapon_part4_name = "";
        this.weapon_part4_level = 0;
        this.weapon_part5_name = "";
        this.weapon_part5_level = 0;
        this.weapon_part6_name = "";
        this.weapon_part6_level = 0;
        this.weapon_cell0 = "";
        this.weapon_cell1 = "";
        this.torso_name = "";
        this.torso_level = 0;
        this.torso_cell = "";
        this.arms_name = "";
        this.arms_level = 0;
        this.arms_cell = "";
        this.legs_name = "";
        this.legs_level = 0;
        this.legs_cell = "";
        this.head_name = "";
        this.head_level = 0;
        this.head_cell = "";
        this.lantern_name = "";
        this.lantern_cell = "";

        for(let key of Object.keys(data)) {
            this[key] = data[key];
        }
    }

    static version(str) {
        let numbers = hashids.decode(str);
        return numbers[0];
    }

    serialize() {
        const weapon = BuildModel.findWeapon(this.weapon_name);
        const weaponType = weapon ? weapon.type : null;

        let params = [
            this.__version,
            DataUtility.getWeaponId(this.weapon_name),
            this.weapon_level,
            DataUtility.getCellId(this.weapon_cell0),
            DataUtility.getCellId(this.weapon_cell1),
            DataUtility.getPartId(weaponType, this.weapon_part1_name),
            this.weapon_part1_level,
            DataUtility.getPartId(weaponType, this.weapon_part2_name),
            this.weapon_part2_level,
            DataUtility.getPartId(weaponType, this.weapon_part3_name),
            this.weapon_part3_level,
            DataUtility.getPartId(weaponType, this.weapon_part4_name),
            this.weapon_part4_level,
            DataUtility.getPartId(weaponType, this.weapon_part5_name),
            this.weapon_part5_level,
            DataUtility.getPartId(weaponType, this.weapon_part6_name),
            this.weapon_part6_level,
            DataUtility.getArmourId(this.head_name),
            this.head_level,
            DataUtility.getCellId(this.head_cell),
            DataUtility.getArmourId(this.torso_name),
            this.torso_level,
            DataUtility.getCellId(this.torso_cell),
            DataUtility.getArmourId(this.arms_name),
            this.arms_level,
            DataUtility.getCellId(this.arms_cell),
            DataUtility.getArmourId(this.legs_name),
            this.legs_level,
            DataUtility.getCellId(this.legs_cell),
            DataUtility.getLanternId(this.lantern_name),
            DataUtility.getCellId(this.lantern_cell)
        ];

        return hashids.encode.apply(hashids, params);
    }

    static deserialize(str) {
        let numbers = hashids.decode(str);

        const stringMap = DataUtility.stringMap(numbers[0]);

        const getString = (type, counter) => {
            if (numbers[counter] === 0) {
                return "";
            }

            if (!(type in stringMap)) {
                return "";
            }

            return stringMap[type][numbers[counter]];
        };

        let idcounter = 0;

        const version = numbers[idcounter++];

        const weaponName = getString("Weapons", idcounter++);
        const weapon = BuildModel.findWeapon(weaponName);
        const partsType = `Parts:${weapon.type}`;

        let data = {
            __version: version,
            weapon_name: weaponName,
            weapon_level: numbers[idcounter++],
            weapon_cell0: getString("Cells", idcounter++),
            weapon_cell1: getString("Cells", idcounter++),
            weapon_part1_name: getString(partsType, idcounter++),
            weapon_part1_level: numbers[idcounter++],
            weapon_part2_name: getString(partsType, idcounter++),
            weapon_part2_level: numbers[idcounter++],
            weapon_part3_name: getString(partsType, idcounter++),
            weapon_part3_level: numbers[idcounter++],
            weapon_part4_name: getString(partsType, idcounter++),
            weapon_part4_level: numbers[idcounter++],
            weapon_part5_name: getString(partsType, idcounter++),
            weapon_part5_level: numbers[idcounter++],
            weapon_part6_name: getString(partsType, idcounter++),
            weapon_part6_level: numbers[idcounter++],
            head_name: getString("Armours", idcounter++),
            head_level: numbers[idcounter++],
            head_cell: getString("Cells", idcounter++),
            torso_name: getString("Armours", idcounter++),
            torso_level: numbers[idcounter++],
            torso_cell: getString("Cells", idcounter++),
            arms_name: getString("Armours", idcounter++),
            arms_level: numbers[idcounter++],
            arms_cell: getString("Cells", idcounter++),
            legs_name: getString("Armours", idcounter++),
            legs_level: numbers[idcounter++],
            legs_cell: getString("Cells", idcounter++),
            lantern_name: getString("Lanterns", idcounter++),
            lantern_cell: getString("Cells", idcounter++)
        };

        return new BuildModel(data);
    }

    get weapon() {
        return BuildModel.findWeapon(this.weapon_name);
    }

    get weaponLevel() {
        return this.weapon_level;
    }

    get weaponCells() {
        return [
            [this.weapon_cell0, BuildModel.findCellByVariantName(this.weapon_cell0)],
            [this.weapon_cell1, BuildModel.findCellByVariantName(this.weapon_cell1)],
        ];
    }

    get armour() {
        return {
            head: BuildModel.findArmour(this.head_name),
            torso: BuildModel.findArmour(this.torso_name),
            arms: BuildModel.findArmour(this.arms_name),
            legs: BuildModel.findArmour(this.legs_name),
        };
    }

    get armourCells() {
        return {
            head: [this.head_cell, BuildModel.findCellByVariantName(this.head_cell)],
            torso: [this.torso_cell, BuildModel.findCellByVariantName(this.torso_cell)],
            arms: [this.arms_cell, BuildModel.findCellByVariantName(this.arms_cell)],
            legs: [this.legs_cell, BuildModel.findCellByVariantName(this.legs_cell)]
        };
    }

    get lantern() {
        return BuildModel.findLantern(this.lantern_name);
    }

    get perks() {
        let perks = {};

        let insertPerk = (perkName, perkValue) => {
            if(!(perkName in perks)) {
                perks[perkName] = perkValue;
            } else {
                perks[perkName] += perkValue;
            }
        };

        let insertCellPerks = cells => {
            for(let [variantName, cell] of cells) {

                if(!variantName || !cell) {
                    continue;
                }

                for(let perk in cell.variants[variantName].perks) {
                    insertPerk(perk, cell.variants[variantName].perks[perk]);
                }
            }
        };

        let insertItemPerks = (itemName, itemType, specificItemType, itemLevel) => {
            const item = BuildModel["find" + itemType](itemName);

            if(item) {
                let itemPerks = BuildModel.getAvailablePerksByLevel(itemName, itemType, itemLevel);

                for(let perk of itemPerks) {
                    insertPerk(perk.name, perk.value);
                }

                if(itemType === "Weapon") {
                    insertCellPerks(this.weaponCells);
                } else {
                    const name = (specificItemType || itemType).toLowerCase();

                    insertCellPerks([
                        [this[name + "_cell"], BuildModel.findCellByVariantName(this[name + "_cell"])]
                    ]);
                }
            }
        };

        insertItemPerks(this.weapon_name, "Weapon", null, this.weapon_level);
        insertItemPerks(this.head_name, "Armour", "Head", this.head_level);
        insertItemPerks(this.torso_name, "Armour", "Torso", this.torso_level);
        insertItemPerks(this.arms_name, "Armour", "Arms", this.arms_level);
        insertItemPerks(this.legs_name, "Armour", "Legs", this.legs_level);
        insertItemPerks(this.lantern_name, "Lantern", null, 0);

        return perks;
    }

    static findWeapon(name) {
        if(name in DataUtility.data().weapons) {
            return DataUtility.data().weapons[name];
        }

        return null;
    }

    static findArmour(name) {
        if(name in DataUtility.data().armours) {
            return DataUtility.data().armours[name];
        }

        return null;
    }

    static findLantern(name) {
        if(name in DataUtility.data().lanterns) {
            return DataUtility.data().lanterns[name];
        }

        return null;
    }

    static findPart(weaponType, partType, partName) {
        if(partName in DataUtility.data().parts[weaponType][partType]) {
            return DataUtility.data().parts[weaponType][partType][partName];
        }

        return null;
    }

    static findCellByVariantName(variantName) {
        for(let cellKey in DataUtility.data().cells) {
            let cell = DataUtility.data().cells[cellKey];

            if(variantName in cell.variants) {
                return cell;
            }
        }

        return null;
    }

    static findPerkByName(perkName) {
        for(let perk in DataUtility.data().perks) {
            if(perk === perkName) {
                return DataUtility.data().perks[perkName];
            }
        }

        return null;
    }

    static getUniqueEffects(itemName, itemType) {
        const item = DataUtility.data()[itemType.toLowerCase() + "s"][itemName];

        if(!item.unique_effects) {
            return [];
        }

        return item.unique_effects;
    }

    static getAvailablePerksByLevel(itemName, itemType, level) {
        const item = DataUtility.data()[itemType.toLowerCase() + "s"][itemName];

        if(!item.perks) {
            return [];
        }

        level = Number(level);

        return item.perks.filter(
            perk =>
                !("from" in perk && "to" in perk) ||
                    (level >= perk.from && level <= perk.to)
        );
    }

    static getAvailableUniqueEffectsByLevel(itemName, itemType, level) {
        const item = DataUtility.data()[itemType.toLowerCase() + "s"][itemName];

        if(!item.unique_effects) {
            return [];
        }

        level = Number(level);

        return item.unique_effects.filter(
            uniqueEffect =>
                !("from" in uniqueEffect && "to" in uniqueEffect) ||
                    (level >= uniqueEffect.from && level <= uniqueEffect.to)
        );
    }

    static tryDeserialize(str) {
        if(BuildModel.isValid(str)) {
            return BuildModel.deserialize(str);
        }

        return BuildModel.empty();
    }

    static empty() {
        return new BuildModel({
            __version: 2,
            weapon_name: "",
            weapon_level: 0,
            weapon_part1_name: "",
            weapon_part1_level: 0,
            weapon_part2_name: "",
            weapon_part2_level: 0,
            weapon_part3_name: "",
            weapon_part3_level: 0,
            weapon_part4_name: "",
            weapon_part4_level: 0,
            weapon_part5_name: "",
            weapon_part5_level: 0,
            weapon_part6_name: "",
            weapon_part6_level: 0,
            weapon_cell0: "",
            weapon_cell1: "",
            torso_name: "",
            torso_level: 0,
            torso_cell: "",
            arms_name: "",
            arms_level: 0,
            arms_cell: "",
            legs_name: "",
            legs_level: 0,
            legs_cell: "",
            head_name: "",
            head_level: 0,
            head_cell: "",
            lantern_name: "",
            lantern_cell: "",
        });
    }

    static isValid(str) {
        const data = hashids.decode(str);
        return data.length === 31;
    }
}
