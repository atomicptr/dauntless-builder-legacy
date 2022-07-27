import { match } from "ts-pattern";

import { CellType } from "./Cell";
import { ElementalType } from "./ElementalType";
import { ItemRarity } from "./ItemRarity";
import { PerkValue } from "./Perks";
import { UniqueEffect } from "./UniqueEffect";

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
    base: number;
    powerSurged?: number;
}

export interface Weapon {
    name: string;
    description: string;
    icon: string;
    type: WeaponType;
    damage: DamageType;
    elemental: ElementalType | null;
    cells: CellType | CellType[] | null;
    power: PowerLevel;
    bond?: {
        elemental: ElementalType;
    };
    perks?: PerkValue[];
    unique_effects?: UniqueEffect[];
    rarity?: ItemRarity;
}

export type WeaponName = "aetherstrikers" | "axe" | "chainblades" | "hammer" | "repeater" | "sword" | "warpike";

export const weaponBuildIdentifier = (weaponType: WeaponType): WeaponName =>
    match<WeaponType, WeaponName>(weaponType)
        .with(WeaponType.AetherStrikers, () => "aetherstrikers")
        .with(WeaponType.Axe, () => "axe")
        .with(WeaponType.ChainBlades, () => "chainblades")
        .with(WeaponType.Hammer, () => "hammer")
        .with(WeaponType.Repeater, () => "repeater")
        .with(WeaponType.Sword, () => "sword")
        .with(WeaponType.WarPike, () => "warpike")
        .run();
