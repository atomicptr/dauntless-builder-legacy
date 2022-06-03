import { ItemPickerItem } from "@src/components/item-picker/ItemPicker";
import { Armour, ArmourType } from "@src/data/Armour";
import { CellType } from "@src/data/Cell";
import { ElementalType } from "@src/data/ElementalType";
import { isArmourType, ItemType } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Weapon, WeaponType } from "@src/data/Weapon";

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
