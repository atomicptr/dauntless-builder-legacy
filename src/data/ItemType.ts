import {match, P} from "ts-pattern";

export enum ItemType {
    Weapon,
    Head,
    Torso,
    Arms,
    Legs,
    Lantern,
    Omnicell,
    Part,
    Cell,
    Perk,
}

export const ArmourItemType = P.union(ItemType.Head, ItemType.Torso, ItemType.Arms, ItemType.Legs);

export const isArmourType = (type: ItemType): boolean =>
    [ItemType.Head, ItemType.Torso, ItemType.Arms, ItemType.Legs].indexOf(type) >= 0;

export const itemTypeIdentifier = (itemType: ItemType) =>
    match(itemType)
        .with(ItemType.Weapon, () => "terms.weapon")
        .with(ItemType.Head, () => "terms.head-armour")
        .with(ItemType.Torso, () => "terms.torso-armour")
        .with(ItemType.Arms, () => "terms.arms-armour")
        .with(ItemType.Legs, () => "terms.legs-armour")
        .with(ItemType.Lantern, () => "terms.lantern")
        .with(ItemType.Omnicell, () => "terms.omnicell")
        .with(ItemType.Part, () => "terms.part")
        .with(ItemType.Cell, () => "terms.cell")
        .with(ItemType.Perk, () => "terms.perk")
        .run();
