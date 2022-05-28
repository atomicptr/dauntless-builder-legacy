import { match, P } from "ts-pattern";

import { ItemType } from "../data/ItemType";

// This code HAS to be the same as the one in scripts/items-i18n.js
const createItemTranslationIdentifier = (...parts: string[]): string =>
    ["item", ...parts]
        .map(p => p.toString().toLowerCase().replace(/\s/g, "-").replace(/ü/g, "u").replace(/[']/g, "").trim())
        .join(".");

export const itemTranslationIdentifier = (type: ItemType, name: string, ...parts: string[]): string =>
    createItemTranslationIdentifier(typeName(type), name, ...parts);

const typeName = (type: ItemType): string =>
    match(type)
        .with(ItemType.Weapon, () => "weapons")
        .with(P.union(ItemType.Head, ItemType.Torso, ItemType.Arms, ItemType.Legs), () => "armours")
        .with(ItemType.Lantern, () => "lanterns")
        .with(ItemType.Omnicell, () => "omnicells")
        .with(ItemType.Cell, () => "cells")
        .run();
