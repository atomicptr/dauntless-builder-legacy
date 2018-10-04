import Hashids from "hashids";
import DataUtility from "../utility/DataUtility";

const hashids = new Hashids("spicy");

export default class BuildModel {
    constructor(data) {
        for(let key of Object.keys(data)) {
            this[key] = data[key];
        }
    }

    serialize() {
        const stringMap = DataUtility.stringMap(this.__version);

        let params = [
            this.__version,
            DataUtility.getKeyByValue(stringMap, this.weapon_name),
            this.weapon_level,
            DataUtility.getKeyByValue(stringMap, this.weapon_cell0),
            DataUtility.getKeyByValue(stringMap, this.weapon_cell1),
            DataUtility.getKeyByValue(stringMap, this.head_name),
            this.head_level,
            DataUtility.getKeyByValue(stringMap, this.head_cell),
            DataUtility.getKeyByValue(stringMap, this.torso_name),
            this.torso_level,
            DataUtility.getKeyByValue(stringMap, this.torso_cell),
            DataUtility.getKeyByValue(stringMap, this.arms_name),
            this.arms_level,
            DataUtility.getKeyByValue(stringMap, this.arms_cell),
            DataUtility.getKeyByValue(stringMap, this.legs_name),
            this.legs_level,
            DataUtility.getKeyByValue(stringMap, this.legs_cell),
            DataUtility.getKeyByValue(stringMap, this.lantern_name),
            DataUtility.getKeyByValue(stringMap, this.lantern_cell)
        ];

        if(this.weapon_name === "Repeater") {
            params = params.concat([
                DataUtility.getKeyByValue(stringMap, this.barrel_name),
                this.barrel_level,
                DataUtility.getKeyByValue(stringMap, this.chamber_name),
                this.chamber_level,
                DataUtility.getKeyByValue(stringMap, this.grip_name),
                this.grip_level,
                DataUtility.getKeyByValue(stringMap, this.prism_name),
                this.prism_level
            ]);
        }

        return hashids.encode.apply(hashids, params);
    }

    static deserialize(str) {
        let numbers = hashids.decode(str);

        const stringMap = DataUtility.stringMap(numbers[0]);

        let idcounter = 0;

        let data = {
            __version: numbers[idcounter++],
            weapon_name: stringMap[numbers[idcounter++]],
            weapon_level: numbers[idcounter++],
            weapon_cell0: stringMap[numbers[idcounter++]],
            weapon_cell1: stringMap[numbers[idcounter++]],
            head_name: stringMap[numbers[idcounter++]],
            head_level: numbers[idcounter++],
            head_cell: stringMap[numbers[idcounter++]],
            torso_name: stringMap[numbers[idcounter++]],
            torso_level: numbers[idcounter++],
            torso_cell: stringMap[numbers[idcounter++]],
            arms_name: stringMap[numbers[idcounter++]],
            arms_level: numbers[idcounter++],
            arms_cell: stringMap[numbers[idcounter++]],
            legs_name: stringMap[numbers[idcounter++]],
            legs_level: numbers[idcounter++],
            legs_cell: stringMap[numbers[idcounter++]],
            lantern_name: stringMap[numbers[idcounter++]],
            lantern_cell: stringMap[numbers[idcounter++]]
        };

        if(data.weapon_name === "Repeater") {
            data.barrel_name = stringMap[numbers[idcounter++]];
            data.barrel_level = numbers[idcounter++];
            data.chamber_name = stringMap[numbers[idcounter++]];
            data.chamber_level = numbers[idcounter++];
            data.grip_name = stringMap[numbers[idcounter++]];
            data.grip_level = numbers[idcounter++];
            data.prism_name = stringMap[numbers[idcounter++]];
            data.prism_level = numbers[idcounter++];
        }

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
            __version: 1,
            weapon_name: "",
            weapon_level: 0,
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
        return data.length === 19 || data.length === 27;
    }
}
