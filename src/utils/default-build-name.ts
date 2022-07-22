import { BuildModel } from "@src/data/BuildModel";
import { ItemType } from "@src/data/ItemType";
import i18n from "@src/i18n";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";

export const defaultBuildName = (build: BuildModel, disableTranslation = false): string =>
    disableTranslation
        ? (build.data.weapon?.name + " " ?? "") + (build.data.omnicell?.name + " " ?? "") + "Build"
        : i18n.t("pages.build.title", {
            omnicell:
                  build.data.omnicell !== null
                      ? i18n.t(itemTranslationIdentifier(ItemType.Omnicell, build.data.omnicell.name, "name"))
                      : "",
            weaponName:
                  build.data.weapon !== null
                      ? i18n.t(itemTranslationIdentifier(ItemType.Weapon, build.data.weapon.name, "name"))
                      : "",
        });
