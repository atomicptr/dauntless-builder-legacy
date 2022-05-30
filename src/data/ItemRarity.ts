import {Weapon} from "./Weapon";
import {Armour} from "./Armour";

export enum ItemRarity {
    Uncommon = "uncommon",
    Rare = "rare",
    Epic = "epic",
    Exotic = "exotic",
}

export const isExotic = (item: Weapon|Armour): boolean =>
    item.rarity === ItemRarity.Exotic;
