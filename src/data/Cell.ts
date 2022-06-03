import {Language} from "@src/i18n";

export enum CellType {
    Prismatic = "Prismatic",
    Alacrity = "Alacrity",
    Brutality = "Brutality",
    Finesse = "Finesse",
    Fortitude = "Fortitude",
    Insight = "Insight"
}

type Rarity = "uncommon" | "rare" | "epic";

export interface Cell {
    name: string;
    slot: CellType;
    variants: {
        [cellVariant: string]: {
            rarity: Rarity;
            perks: {
                [perkName: string]: number;
            }
        }
    }

    i18n?: {
        [language in Language]: {
            name?: string;
            variants?: string[];
        }
    }
}
