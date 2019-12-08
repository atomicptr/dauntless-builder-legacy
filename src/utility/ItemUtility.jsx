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

    static isRepeater(item) {
        return item.type === "repeater";
    }

    static itemType(type) {
        switch(type) {
            case "weapon":
            case "sword":
            case "chainBlades":
            case "axe":
            case "hammer":
            case "warPike":
            case "repeater":
            case "aetherStrikers":
                return "weapon";
            case "armour":
            case "head":
            case "torso":
            case "arms":
            case "legs":
                return "armour";
        }

        return "lantern";
    }

    static itemTr(item, ...ext) {
        const args = [
            `${ItemUtility.itemType(item.type)}s`,
            item.name,
            ...ext
        ];
        return ItemUtility.getTr(...args);
    }

    static getTr(...ext) {
        return `game.${ext.join(".")}`;
    }

    static formatWeaponTypeForParts(weaponType) {
        if (!weaponType) {
            return "null";
        }

        return weaponType.toLowerCase().replace(" ", "");
    }
}
