import { Armour, ArmourType } from "../../data/Armour";
import { CellType } from "../../data/Cell";
import { ElementalType } from "../../data/ElementalType";
import { isArmourType, ItemType } from "../../data/ItemType";
import { Lantern } from "../../data/Lantern";
import { Weapon, WeaponType } from "../../data/Weapon";
import { ItemPickerItem } from "../item-picker/ItemPicker";

export const filterBySearchQuery =
    (query: string) =>
        (item: ItemPickerItem, itemType: ItemType): boolean => {
            if (!item) {
                return false;
            }

            if (item.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                return true;
            }

            if (itemType === ItemType.Weapon || isArmourType(itemType) || itemType === ItemType.Lantern) {
                const description = (item as Weapon | Armour | Lantern).description?.toLowerCase();
                return description ? description.toLowerCase().indexOf(query.toLowerCase()) > -1 : false;
            }

            return false;
        };

export const filterByWeaponType =
    (weaponType: WeaponType) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            (item as Weapon).type === weaponType;

export const filterByArmourType =
    (armourType: ArmourType) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            (item as Armour).type === armourType;

export const filterByElement =
    (elemental: ElementalType) =>
        (item: ItemPickerItem, itemType: ItemType): boolean =>
            itemType === ItemType.Weapon
                ? (item as Weapon).elemental === elemental
                : (item as Armour).strength === elemental;

export const filterByCellSlot =
    (cellSlot: CellType) =>
        (item: ItemPickerItem, _itemType: ItemType): boolean =>
            ((item as Weapon | Armour | Lantern).cells?.indexOf(cellSlot) ?? -1) > -1;
