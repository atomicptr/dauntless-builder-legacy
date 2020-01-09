import Hashids from "hashids";
import Case from "case";
import DataUtility from "../utility/DataUtility";
import ItemUtility from "../utility/ItemUtility";

const hashids = new Hashids("spicy");

export default class BuildModel {
    constructor(data) {
        // set default parameter values
        this.__version = 3;
        this.weapon_name = "";
        this.weapon_level = 0;
        this.weapon_part1_name = "";
        this.weapon_part2_name = "";
        this.weapon_part3_name = "";
        this.weapon_part4_name = "";
        this.bond_weapon_name = "";
        this.weapon_part6_name = "";
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
            DataUtility.getPartId(weaponType, this.weapon_part2_name),
            DataUtility.getPartId(weaponType, this.weapon_part3_name),
            DataUtility.getPartId(weaponType, this.weapon_part4_name),
            DataUtility.getWeaponId(this.bond_weapon_name),
            DataUtility.getPartId(weaponType, this.weapon_part6_name),
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

        const weaponName = getString("weapons", idcounter++);
        const weapon = BuildModel.findWeapon(weaponName);
        const partsType = weapon ? `parts:${Case.camel(weapon.type).toLowerCase()}` : null;

        let data = {
            __version: version,
            weapon_name: weaponName,
            weapon_level: numbers[idcounter++],
            weapon_cell0: getString("cells", idcounter++),
            weapon_cell1: getString("cells", idcounter++),
            weapon_part1_name: getString(partsType, idcounter++),
            weapon_part2_name: getString(partsType, idcounter++),
            weapon_part3_name: getString(partsType, idcounter++),
            weapon_part4_name: getString(partsType, idcounter++),
            // part 5 was unused and is now used for bond weapons
            bond_weapon_name: getString("weapons", idcounter++),
            weapon_part6_name: getString(partsType, idcounter++),
            head_name: getString("armours", idcounter++),
            head_level: numbers[idcounter++],
            head_cell: getString("cells", idcounter++),
            torso_name: getString("armours", idcounter++),
            torso_level: numbers[idcounter++],
            torso_cell: getString("cells", idcounter++),
            arms_name: getString("armours", idcounter++),
            arms_level: numbers[idcounter++],
            arms_cell: getString("cells", idcounter++),
            legs_name: getString("armours", idcounter++),
            legs_level: numbers[idcounter++],
            legs_cell: getString("cells", idcounter++),
            lantern_name: getString("lanterns", idcounter++),
            lantern_cell: getString("cells", idcounter++)
        };

        return new BuildModel(data);
    }

    static convertVersion2To3(version2BuildString) {
        let numbers = hashids.decode(version2BuildString);

        let data = {
            __version: 3,
            weapon_name: numbers[1],
            weapon_level: numbers[2],
            weapon_cell0: numbers[3],
            weapon_cell1: numbers[4],
            weapon_part1_name: numbers[5],
            weapon_part2_name: numbers[7],
            weapon_part3_name: numbers[9],
            weapon_part4_name: numbers[11],
            bond_weapon_name: numbers[13],
            weapon_part6_name: numbers[15],
            head_name: numbers[17],
            head_level: numbers[18],
            head_cell: numbers[19],
            torso_name: numbers[20],
            torso_level: numbers[21],
            torso_cell: numbers[22],
            arms_name: numbers[23],
            arms_level: numbers[24],
            arms_cell: numbers[25],
            legs_name: numbers[26],
            legs_level: numbers[27],
            legs_cell: numbers[28],
            lantern_name: numbers[29],
            lantern_cell: numbers[30]
        };

        return hashids.encode(Object.values(data));
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

        let insertBondItemPerks = (itemName, itemLevel) => {
            const item = BuildModel.findWeapon(itemName);

            if(item) {
                let itemPerks = BuildModel.getAvailablePerksByLevel(itemName, "weapon", itemLevel);

                for(let perk of itemPerks) {
                    insertPerk(perk.name, perk.value);
                }
            }
        };

        insertItemPerks(this.weapon_name, "Weapon", null, this.weapon_level);
        insertBondItemPerks(this.bond_weapon_name, this.weapon_level);
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
        if(partName in DataUtility.data().parts[ItemUtility.formatWeaponTypeForParts(weaponType)][partType]) {
            return DataUtility.data().parts[ItemUtility.formatWeaponTypeForParts(weaponType)][partType][partName];
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

    static findWeaponBondFilterRules(itemName) {
        const weapon = BuildModel.findWeapon(itemName);

        if (!weapon || !("bond" in weapon)) {
            return null;
        }

        return weapon.bond;
    }

    static findItemsByMatchingFilter(itemType, filter) {
        if (!filter) {
            return [];
        }

        const items = DataUtility.data()[itemType.toLowerCase() + "s"];

        const isFilterMatching = (item, filter) => {
            for (let key of Object.keys(filter)) {
                if (!(key in item)) {
                    return false;
                }

                if (item[key] != filter[key]) {
                    return false;
                }
            }

            return true;
        };

        return Object.values(items).filter(item => isFilterMatching(item, filter));
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
        ).map(it => Object.assign(it, {title: it.title ? `${it.title.toLowerCase()}` : null}));
    }

    static tryDeserialize(str) {
        if(BuildModel.isValid(str)) {
            return BuildModel.deserialize(str);
        }

        return BuildModel.empty();
    }

    static empty() {
        return new BuildModel({
            __version: 3,
            weapon_name: "",
            weapon_level: 0,
            weapon_part1_name: "",
            weapon_part2_name: "",
            weapon_part3_name: "",
            weapon_part4_name: "",
            bond_weapon_name: "",
            weapon_part6_name: "",
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
        return data.length === 25;
    }
}
