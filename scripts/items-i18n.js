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
                    i18nValues.en[
                        createItemTranslationIdentifier(category, itemName, "unique_effects", index, "description")
                    ] = ue.description;
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

                    if (part.i18n) {
                        for (let lang of Object.keys(part.i18n)) {
                            if (!(lang in i18nValues)) {
                                i18nValues[lang] = {};
                            }

                            for (let field of Object.keys(part.i18n[lang])) {
                                const value = part.i18n[lang][field];

                                if (typeof value === "string") {
                                    i18nValues[lang][
                                        createItemTranslationIdentifier(category, itemName, partType, partName, field)
                                    ] = value;
                                    continue;
                                }

                                if (Array.isArray(value)) {
                                    for (let index in value) {
                                        const v = value[index];

                                        if (typeof v === "string") {
                                            i18nValues[lang][
                                                createItemTranslationIdentifier(
                                                    category,
                                                    itemName,
                                                    partType,
                                                    partName,
                                                    field,
                                                    index,
                                                )
                                            ] = v;
                                            continue;
                                        }

                                        if (typeof v === "object") {
                                            if (v.name) {
                                                i18nValues[lang][
                                                    createItemTranslationIdentifier(
                                                        category,
                                                        itemName,
                                                        partType,
                                                        partName,
                                                        field,
                                                        index,
                                                        "name",
                                                    )
                                                ] = v.name;
                                            }

                                            if (v.description) {
                                                i18nValues[lang][
                                                    createItemTranslationIdentifier(
                                                        category,
                                                        itemName,
                                                        partType,
                                                        partName,
                                                        field,
                                                        index,
                                                        "description",
                                                    )
                                                ] = v.description;
                                            }
                                        }
                                    }
                                    continue;
                                }

                                console.error("Unknown item found", lang, partType, partName, field, value);
                                process.exit(1);
                            }
                        }
                    }
                }
            }
        }

        if (category === "perks" && item.effects) {
            for (let key of Object.keys(item.effects)) {
                const effect = item.effects[key];

                if (effect.description && typeof effect.description === "string") {
                    i18nValues.en[createItemTranslationIdentifier(category, itemName, "effects", key, "description")] =
                        effect.description;
                    continue;
                }

                if (effect.description && Array.isArray(effect.description)) {
                    for (let index in effect.description) {
                        i18nValues.en[
                            createItemTranslationIdentifier(category, itemName, "effects", key, "description", index)
                        ] = effect.description[index];
                    }
                }
            }
        }

        if (item.i18n) {
            for (let lang of Object.keys(item.i18n)) {
                if (!(lang in i18nValues)) {
                    i18nValues[lang] = {};
                }

                for (let field of Object.keys(item.i18n[lang])) {
                    const value = item.i18n[lang][field];

                    if (typeof value === "string") {
                        i18nValues[lang][createItemTranslationIdentifier(category, itemName, field)] = value;
                        continue;
                    }

                    if (Array.isArray(value)) {
                        for (let index in value) {
                            const v = value[index];

                            if (typeof v === "string") {
                                i18nValues[lang][createItemTranslationIdentifier(category, itemName, field, index)] = v;
                                continue;
                            }

                            if (typeof v === "object") {
                                if (v.name) {
                                    i18nValues[lang][
                                        createItemTranslationIdentifier(category, itemName, field, index, "name")
                                    ] = v.name;
                                }

                                if (v.description) {
                                    i18nValues[lang][
                                        createItemTranslationIdentifier(category, itemName, field, index, "description")
                                    ] = v.description;
                                }
                            }
                        }
                        continue;
                    }

                    if (field === "lantern_ability") {
                        if (value.instant) {
                            i18nValues[lang][createItemTranslationIdentifier(category, itemName, field, "instant")] =
                                value.instant;
                        }

                        if (value.hold) {
                            i18nValues[lang][createItemTranslationIdentifier(category, itemName, field, "hold")] =
                                value.hold;
                        }
                        continue;
                    }

                    if (field === "effects") {
                        for (let key of Object.keys(value)) {
                            if (Array.isArray(value[key].description)) {
                                for (let index in value[key].description) {
                                    i18nValues[lang][
                                        createItemTranslationIdentifier(
                                            category,
                                            itemName,
                                            field,
                                            key,
                                            "description",
                                            index,
                                        )
                                    ] = value[key].description[index];
                                }
                                continue;
                            }

                            i18nValues[lang][
                                createItemTranslationIdentifier(category, itemName, field, key, "description")
                            ] = value[key].description;
                        }
                        continue;
                    }

                    console.error("Unknown item found", lang, field, value);
                    process.exit(1);
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
