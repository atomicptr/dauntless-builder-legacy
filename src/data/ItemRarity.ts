import { Armour } from "./Armour";
import { Weapon } from "./Weapon";

export enum ItemRarity {
    Uncommon = "uncommon",
    Rare = "rare",
    Epic = "epic",
    Exotic = "exotic",
}

export const isExotic = (item: Weapon | Armour): boolean => item.rarity === ItemRarity.Exotic;
