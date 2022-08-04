import dauntlessBuilderData from "@src/data/Data";
import { match, P } from "ts-pattern";

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

export const itemTypeLocalizationIdentifier = (itemType: ItemType) =>
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

export const itemTypeData = (itemType: ItemType) =>
    match(itemType)
        .with(ItemType.Weapon, () => dauntlessBuilderData.weapons)
        .with(ArmourItemType, () => dauntlessBuilderData.armours)
        .with(ItemType.Lantern, () => dauntlessBuilderData.lanterns)
        .with(ItemType.Omnicell, () => dauntlessBuilderData.omnicells)
        .with(ItemType.Cell, () => dauntlessBuilderData.cells)
        .otherwise(() => ({}));

export const itemTypeIcon = (itemType: ItemType) =>
    match(itemType)
        .with(ItemType.Weapon, () => "/assets/icons/generic/Weapon.png")
        .with(ItemType.Head, () => "/assets/icons/generic/Head.png")
        .with(ItemType.Torso, () => "/assets/icons/generic/Torso.png")
        .with(ItemType.Arms, () => "/assets/icons/generic/Arms.png")
        .with(ItemType.Legs, () => "/assets/icons/generic/Legs.png")
        .with(ItemType.Lantern, () => "/assets/icons/generic/Lantern.png")
        .with(ItemType.Omnicell, () => "/assets/icons/generic/Omnicell.png")
        .otherwise(() => "/assets/icons/noicon.png");
