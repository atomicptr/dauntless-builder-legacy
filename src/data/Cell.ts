import { ItemRarity } from "@src/data/ItemRarity";

export enum CellType {
    Prismatic = "Prismatic",
    Alacrity = "Alacrity",
    Brutality = "Brutality",
    Finesse = "Finesse",
    Fortitude = "Fortitude",
    Insight = "Insight",
}

export interface Cell {
    name: string;
    slot: CellType;
    variants: {
        [cellVariant: string]: {
            rarity: ItemRarity;
            perks: {
                [perkName: string]: number;
            };
        };
    };
}
