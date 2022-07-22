import { Language } from "@src/i18n";

import { CellType } from "./Cell";
import { ElementalType } from "./ElementalType";
import { ItemRarity } from "./ItemRarity";
import { PerkValue } from "./Perks";
import { UniqueEffect } from "./UniqueEffect";

export enum ArmourType {
    Torso = "Torso",
    Arms = "Arms",
    Head = "Head",
    Legs = "Legs",
}

export interface ResistanceLevel {
    base: number;
    powerSurged?: number;
}

export interface Armour {
    name: string;
    description: string;
    icon: string;
    type: ArmourType;
    strength: ElementalType | null;
    weakness: ElementalType | null;
    cells: CellType | CellType[] | null;
    resistance: ResistanceLevel;
    perks?: PerkValue[];
    unique_effects?: UniqueEffect[];
    rarity?: ItemRarity;

    i18n?: {
        [language in Language]: {
            name?: string;
            description?: string;
            unique_effects?: {
                name?: string;
                description?: string;
            }[];
        };
    };
}
