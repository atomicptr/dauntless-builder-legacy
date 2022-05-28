import {Language} from "../i18n";
import {CellType} from "./Cell";
import {ElementalType} from "./ElementalType";
import {PerkValue} from "./Perks";
import {UniqueEffect} from "./UniqueEffect";

export enum ArmourType {
    Torso = "Torso",
    Arms = "Arms",
    Head = "Head",
    Legs = "Legs",
}

export interface ResistanceLevel {
    0: number,
    1?: number,
}

export interface Armour {
    name: string;
    description: string;
    icon: string;
    type: ArmourType;
    strength: ElementalType|null;
    weakness: ElementalType|null;
    cells: CellType|CellType[]|null;
    resistance: ResistanceLevel;
    perks?: PerkValue[];
    unique_effects?: UniqueEffect[];

    i18n?: {
        [language in Language]: {
            name?: string;
            description?: string;
            unique_effects?: {
                name?: string,
                description?: string
            }[]
        }
    }
}
