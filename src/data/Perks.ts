import { Language } from "@src/i18n";

import { CellType } from "./Cell";

export interface PerkValue {
    name: string;
    value: number;
    powerSurged?: boolean;
}

export interface Perk {
    name: string;
    description: string;
    type: CellType;
    effects: {
        [index: string]: {
            description: string | string[];
            values?: {
                [key: string]: string;
            };
        };
    };

    i18n?: {
        [language in Language]: {
            name?: string;
            description?: string;
            effects: {
                [index: string]: {
                    description?: string | string[];
                };
            };
        };
    };
}
