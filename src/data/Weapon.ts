import {CellType} from "./Cell";
import {ElementalType} from "./ElementalType";
import {UniqueEffect} from "./UniqueEffect";
import {PerkValue} from "./Perks";
import {Language} from "../i18n";

export enum WeaponType {
    AetherStrikers = "Aether Strikers",
    Axe = "Axe",
    ChainBlades = "Chain Blades",
    Hammer = "Hammer",
    Repeater = "Repeater",
    Sword = "Sword",
    WarPike = "War Pike",
}

export enum DamageType {
    Blunt = "Blunt",
    Slashing = "Slashing",
}

export interface PowerLevel {
    0: number,
    1?: number,
}

export interface Weapon {
    name: string;
    description: string;
    icon: string;
    type: WeaponType;
    damage: DamageType;
    elemental: ElementalType|null;
    cells: CellType|CellType[]|null;
    power: PowerLevel;
    bond: ElementalType | null;
    perks?: PerkValue[];
    unique_effects?: UniqueEffect[];

    i18n?: {
        [language in Language]: {
            name?: string;
            description?: string;
            unique_effects: {
                name?: string,
                description?: string
            }[]
        }
    }
}
