import { match } from "ts-pattern";

import { ArmourItemType, ItemType } from "../data/ItemType";
import { partBuildIdentifier, PartType } from "../data/Part";
import { weaponBuildIdentifier, WeaponType } from "../data/Weapon";

// This code HAS to be the same as the one in scripts/items-i18n.js
const createItemTranslationIdentifier = (...parts: string[]): string =>
    ["item", ...parts]
        .map(p => p.toString().toLowerCase().replace(/\s/g, "-").replace(/ü/g, "u").replace(/[']/g, "").trim())
        .join(".");

export const itemTranslationIdentifier = (type: ItemType, name: string, ...parts: string[]): string =>
    createItemTranslationIdentifier(typeName(type), name, ...parts);

export const partsTranslationIdentifier = (
    weaponType: WeaponType,
    partType: PartType,
    name: string,
    ...parts: string[]
): string =>
    createItemTranslationIdentifier(
        typeName(ItemType.Part),
        weaponBuildIdentifier(weaponType),
        partBuildIdentifier(partType),
        name,
        ...parts,
    );

const typeName = (type: ItemType): string =>
    match(type)
        .with(ItemType.Weapon, () => "weapons")
        .with(ArmourItemType, () => "armours")
        .with(ItemType.Lantern, () => "lanterns")
        .with(ItemType.Omnicell, () => "omnicells")
        .with(ItemType.Cell, () => "cells")
        .with(ItemType.Perk, () => "perks")
        .with(ItemType.Part, () => "parts")
        .run();
