import DataUtil from "./DataUtil";

export default class MiscUtils {
    static getTierName(tier) {
        switch(Number(tier)) {
            case 1: return "Tier 1 - The Sheltered Frontier";
            case 2: return "Tier 2 - The Monstrous Verge";
            case 3: return "Tier 3 - The Yonder Keys";
            case 4: return "Tier 4 - The Uncharted Reaches";
            case 5: return "Tier 5 - The Maelstrom";
        }

        return `Tier ??? - ${tier} is not a valid tier.`;
    }

    static maxLevel(collection, itemName) {
        if(!itemName || !(collection in DataUtil.data())) {
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

        return Math.max(...Object.keys(DataUtil.data()[collection][itemName][levelKey]).map(k => Number(k)));
    }
}