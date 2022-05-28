import { ItemType } from "../data/ItemType";

// This code HAS to be the same as the one in scripts/items-i18n.js
const createItemTranslationIdentifier = (...parts: string[]): string =>
    ["item", ...parts]
        .map(p => p.toString().toLowerCase().replace(/\s/g, "-").replace(/ü/g, "u").replace(/[']/g, "").trim())
        .join(".");

export const itemTranslationIdentifier = (type: ItemType, name: string, ...parts: string[]): string =>
    createItemTranslationIdentifier(typeName(type), name, ...parts);

const typeName = (type: ItemType): string => {
    switch (type) {
        case ItemType.Weapon:
            return "weapons";
        case ItemType.Head:
        case ItemType.Torso:
        case ItemType.Arms:
        case ItemType.Legs:
            return "armours";
        case ItemType.Lantern:
            return "lanterns";
        case ItemType.Omnicell:
            return "omnicells";
        case ItemType.Cell:
            return "cells";
    }
};
