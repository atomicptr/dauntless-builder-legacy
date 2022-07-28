import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataJsonPath = path.join(__dirname, "..", "public", "data.json");

if (!fs.existsSync(dataJsonPath)) {
    console.error("data.json does not exist, run yarn build:data first");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataJsonPath).toString());

// This code HAS to be the same as the one in src/utils/item-translation-identifier.ts
const createItemTranslationIdentifier = (...parts) =>
    ["item", ...parts]
        .map(p => p.toString().toLowerCase().replace(/\s/g, "-").replace(/ü/g, "u").replace(/[']/g, "").trim())
        .join(".");

const i18nValues = {
    en: {},
};

const skipCategory = ["misc"];

for (let category of Object.keys(data)) {
    if (skipCategory.indexOf(category) > -1) {
        continue;
    }

    const items = data[category];

    for (let itemName of Object.keys(items)) {
        const item = items[itemName];

        if (item.name) {
            i18nValues.en[createItemTranslationIdentifier(category, itemName, "name")] = item.name;
        }

        if (item.description) {
            i18nValues.en[createItemTranslationIdentifier(category, itemName, "description")] = item.description;
        }

        if (item.unique_effects) {
            for (let index in item.unique_effects) {
                const ue = item.unique_effects[index];

                if (ue.description) {
                    const firstItem = Object.values(items).find(item => item.unique_effects?.find(
                        uniqueEffect => uniqueEffect.description === ue.description,
                    )) ?? item;
                    const firstIndex = Object.values(firstItem.unique_effects).findIndex(
                        uniqueEffect => uniqueEffect.description === ue.description,
                    );
                    i18nValues.en[
                        createItemTranslationIdentifier(category, itemName, "unique_effects", index, "description")
                    ] =
                        firstItem.name === item.name && firstIndex.toString() === index.toString()
                            ? ue.description
                            : `$t(${createItemTranslationIdentifier(
                                  category,
                                  firstItem.name,
                                  "unique_effects",
                                  firstIndex,
                                  "description",
                              )})`;
                }

                if (ue.title) {
                    i18nValues.en[
                        createItemTranslationIdentifier(category, itemName, "unique_effects", index, "title")
                    ] = ue.title;
                }
            }
        }

        if (category === "cells" && item.variants) {
            for (let variantName of Object.keys(item.variants)) {
                const index = Object.keys(item.variants).indexOf(variantName);
                if (index < 0) {
                    continue;
                }
                i18nValues.en[createItemTranslationIdentifier(category, itemName, "variants", index)] = variantName;
            }
        }

        if (category === "lanterns" && item.lantern_ability) {
            if (item.lantern_ability.instant) {
                i18nValues.en[createItemTranslationIdentifier(category, itemName, "lantern_ability", "instant")] =
                    item.lantern_ability.instant;
            }

            if (item.lantern_ability.hold) {
                i18nValues.en[createItemTranslationIdentifier(category, itemName, "lantern_ability", "hold")] =
                    item.lantern_ability.hold;
            }
        }

        if (category === "omnicells") {
            if (item.active) {
                i18nValues.en[createItemTranslationIdentifier(category, itemName, "active")] = item.active;
            }

            if (item.passive) {
                i18nValues.en[createItemTranslationIdentifier(category, itemName, "passive")] = item.passive;
            }
        }

        if (category === "parts") {
            for (let partType of Object.keys(item)) {
                for (let partName of Object.keys(item[partType])) {
                    const part = item[partType][partName];

                    if (part.name) {
                        i18nValues.en[createItemTranslationIdentifier(category, itemName, partType, partName, "name")] =
                            part.name;
                    }

                    for (let index in part.part_effect) {
                        i18nValues.en[
                            createItemTranslationIdentifier(
                                category,
                                itemName,
                                partType,
                                partName,
                                "part_effect",
                                index,
                            )
                        ] = part.part_effect[index];
                    }
                }
            }
        }

        if (category === "perks" && item.effects) {
            for (let key of Object.keys(item.effects)) {
                const effect = item.effects[key];

                if (effect.description && typeof effect.description === "string") {
                    const firstIndex = Object.values(item.effects).findIndex(e => e.description === effect.description);
                    const firstKey = Object.keys(item.effects)[firstIndex];
                    i18nValues.en[createItemTranslationIdentifier(category, itemName, "effects", key, "description")] =
                        firstKey.toString() === key.toString()
                            ? effect.description
                            : `$t(${createItemTranslationIdentifier(
                                  category,
                                  itemName,
                                  "effects",
                                  firstKey,
                                  "description",
                              )})`;
                    continue;
                }

                if (effect.description && Array.isArray(effect.description)) {
                    for (let index in effect.description) {
                        const firstEffectIndex = Object.values(item.effects).findIndex(e =>
                            e.description.some(desc => desc === effect.description[index]),
                        );
                        const firstEffectKey = Object.keys(item.effects)[firstEffectIndex];
                        const firstIndex = item.effects[firstEffectKey].description.findIndex(
                            desc => desc === effect.description[index],
                        );

                        i18nValues.en[
                            createItemTranslationIdentifier(category, itemName, "effects", key, "description", index)
                        ] =
                            effect.description[index] === null
                                ? null
                                : firstEffectKey.toString() === key.toString() &&
                                  firstIndex.toString() === index.toString()
                                ? effect.description[index]
                                : `$t(${createItemTranslationIdentifier(
                                      category,
                                      itemName,
                                      "effects",
                                      firstEffectKey,
                                      "description",
                                      firstIndex,
                                  )})`;
                    }
                }
            }
        }
    }
}

const targetDir = path.join(__dirname, "..", "src", "translations", "items");

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}

for (let lang of Object.keys(i18nValues)) {
    const filename = `items.${lang}.json`;

    const filepath = path.join(targetDir, filename);

    console.log(`Writing ${filepath}...`);

    fs.writeFileSync(filepath, JSON.stringify(i18nValues[lang], null, "    "));
}

console.log("Done!");
