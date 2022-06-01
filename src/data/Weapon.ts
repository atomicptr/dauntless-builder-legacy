import {Language} from "../i18n";
import {CellType} from "./Cell";
import {ElementalType} from "./ElementalType";
import {PerkValue} from "./Perks";
import {UniqueEffect} from "./UniqueEffect";
import {match} from "ts-pattern";
import {ItemRarity} from "./ItemRarity";

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
    base: number,
    powerSurged?: number,
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
    rarity?: ItemRarity;

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

export const weaponBuildIdentifier = (weaponType: WeaponType): string =>
    match(weaponType)
        .with(WeaponType.AetherStrikers, () => "aetherstrikers")
        .with(WeaponType.Axe, () => "axe")
        .with(WeaponType.ChainBlades, () => "chainblades")
        .with(WeaponType.Hammer, () => "hammer")
        .with(WeaponType.Repeater, () => "repeater")
        .with(WeaponType.Sword, () => "sword")
        .with(WeaponType.WarPike, () => "warpike")
        .run();
