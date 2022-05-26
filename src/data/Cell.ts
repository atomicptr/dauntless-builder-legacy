import {Language} from "../i18n";

export enum CellType {
    Prismatic = "Prismatic",
    Alacrity = "Alacrity",
    Brutality = "Brutality",
    Finesse = "Finesse",
    Fortitude = "Fortitude",
    Insight = "Insight"
}

export interface Cell {
    name: string;
    slot: CellType;
    variants: {
        [cellVariant: string]: {
            rarity: string;
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
