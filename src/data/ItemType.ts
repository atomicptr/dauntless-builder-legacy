import { P } from "ts-pattern";

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
