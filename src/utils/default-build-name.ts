import { BuildModel } from "@src/data/BuildModel";
import { ItemType } from "@src/data/ItemType";
import i18n from "@src/i18n";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";

export const defaultBuildName = (build: BuildModel, disableTranslation = false): string => {
    const weaponName = build.data.weapon?.name;
    const omnicell = build.data.omnicell?.name;

    const renderName = (itemType: ItemType, name: string) =>
        disableTranslation ? name : i18n.t(itemTranslationIdentifier(itemType, name, "name"));

    if (!weaponName && !omnicell) {
        return "";
    }

    return i18n.t("pages.build.title", {
        omnicell: omnicell ? renderName(ItemType.Omnicell, omnicell) : "",
        weaponName: weaponName ? renderName(ItemType.Weapon, weaponName) : "",
    });
};
