import DataUtility from "./DataUtility";

export default class ItemUtility {
    static maxLevel(collection, itemName) {
        if(!itemName || !(collection in DataUtility.data())) {
            return 0;
        }

        let levelKey = null;

        switch(collection) {
            case "weapons": levelKey = "power"; break;
            case "armours": levelKey = "resistance"; break;
        }

        if(!levelKey) {
            return 0;
        }

        return Math.max(...Object.keys(DataUtility.data()[collection][itemName][levelKey]).map(k => Number(k)));
    }

    static levelString(level = 0) {
        let levelString = "";

        if(level && level > 0) {
            levelString = `+${level}`;
        }

        return levelString;
    }

    static itemType(type) {
        switch(type) {
            case "Weapon":
            case "Sword":
            case "Chain Blades":
            case "Axe":
            case "Hammer":
            case "War Pike":
            case "Repeater":
            case "Aether Strikers":
                return "Weapon";
            case "Head":
            case "Torso":
            case "Arms":
            case "Legs":
                return "Armour";
        }

        return "Lantern";
    }

    static formatWeaponTypeForParts(weaponType) {
        if (!weaponType) {
            return "null";
        }

        return weaponType.toLowerCase().replace(" ", "");
    }
}
