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

export const isArmourType = (type: ItemType): boolean =>
    [ItemType.Head, ItemType.Torso, ItemType.Arms, ItemType.Legs].indexOf(type) >= 0;
