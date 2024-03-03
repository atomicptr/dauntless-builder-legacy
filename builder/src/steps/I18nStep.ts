import * as fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

const createItemTranslationIdentifier = (...parts: string[]): string =>
    ["item", ...parts]
        .map(p => p.toString().toLowerCase().replace(/\s/g, "-").replace(/ü/g, "u").replace(/[']/g, "").trim())
        .join(".");

const skipCategories = ["misc"];

interface GenericEntity {
    name: string;
    description: string;
    unique_effects?: GenericEntity[];
    effects?: {
        [ident: string]: Effect;
    };
}

interface Effect {
    description: string | string[];
}

export class I18nStep extends WithStepLogger implements Step {
    name(): string {
        return "i18n";
    }

    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    async run(runConfig: RunConfig): Promise<void> {
        const dataJsonPath = path.join(runConfig.publicDir, "data.json");

        if (!fs.existsSync(dataJsonPath)) {
            this.fatal(`${dataJsonPath} does not exist, run data step first!`);
        }

        const data = JSON.parse(fs.readFileSync(dataJsonPath).toString());

        const values: {
            [identifier: string]: string;
        } = {};

        for (const category of Object.keys(data)) {
            if (skipCategories.indexOf(category) > -1) {
                continue;
            }

            const items = data[category];

            for (const itemName of Object.keys(items)) {
                const item = items[itemName];

                if (item.name) {
                    values[createItemTranslationIdentifier(category, itemName, "name")] = item.name;
                }

                if (item.description) {
                    const firstItem =
                        Object.values(items as GenericEntity[]).find(i => i.description === item.description) ?? item;
                    values[createItemTranslationIdentifier(category, itemName, "description")] =
                        firstItem.name === item.name
                            ? item.description
                            : `$t(${createItemTranslationIdentifier(category, firstItem.name, "description")})`;
                }

                if (item.unique_effects) {
                    for (const index in item.unique_effects) {
                        const ue = item.unique_effects[index];

                        if (ue.description) {
                            const firstItem =
                                Object.values(items as GenericEntity[]).find(item =>
                                    item.unique_effects?.find(
                                        uniqueEffect => uniqueEffect.description === ue.description,
                                    ),
                                ) ?? item;
                            const firstIndex = Object.values(firstItem.unique_effects).findIndex(
                                uniqueEffect => (uniqueEffect as GenericEntity).description === ue.description,
                            );
                            values[
                                createItemTranslationIdentifier(
                                    category,
                                    itemName,
                                    "unique_effects",
                                    index,
                                    "description",
                                )
                            ] =
                                firstItem.name === item.name && firstIndex.toString() === index.toString()
                                    ? ue.description
                                    : `$t(${createItemTranslationIdentifier(
                                        category,
                                        firstItem.name,
                                        "unique_effects",
                                        firstIndex.toString(),
                                        "description",
                                    )})`;
                        }

                        if (ue.title) {
                            values[
                                createItemTranslationIdentifier(category, itemName, "unique_effects", index, "title")
                            ] = ue.title;
                        }
                    }
                }

                if (category === "cells" && item.variants) {
                    for (const variantName of Object.keys(item.variants)) {
                        const index = Object.keys(item.variants).indexOf(variantName);
                        if (index < 0) {
                            continue;
                        }
                        values[createItemTranslationIdentifier(category, itemName, "variants", index.toString())] =
                            variantName;
                    }
                }

                if (category === "lanterns" && item.lantern_ability) {
                    if (item.lantern_ability.instant) {
                        values[createItemTranslationIdentifier(category, itemName, "lantern_ability", "instant")] =
                            item.lantern_ability.instant;
                    }

                    if (item.lantern_ability.hold) {
                        values[createItemTranslationIdentifier(category, itemName, "lantern_ability", "hold")] =
                            item.lantern_ability.hold;
                    }
                }

                if (category === "omnicells") {
                    if (item.active) {
                        values[createItemTranslationIdentifier(category, itemName, "active")] = item.active;
                    }

                    if (item.passive) {
                        values[createItemTranslationIdentifier(category, itemName, "passive")] = item.passive;
                    }
                }

                if (category === "parts") {
                    for (const partType of Object.keys(item)) {
                        for (const partName of Object.keys(item[partType])) {
                            const part = item[partType][partName];

                            if (part.name) {
                                values[
                                    createItemTranslationIdentifier(category, itemName, partType, partName, "name")
                                ] = part.name;
                            }

                            for (const index in part.part_effect) {
                                values[
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
                    for (const key of Object.keys(item.effects)) {
                        const effect = item.effects[key];

                        if (effect.description && typeof effect.description === "string") {
                            const firstIndex = (Object.values(item.effects) as Effect[]).findIndex(
                                e => e.description === effect.description,
                            );
                            const firstKey = Object.keys(item.effects)[firstIndex];
                            values[createItemTranslationIdentifier(category, itemName, "effects", key, "description")] =
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
                            for (const index in effect.description) {
                                const firstEffectIndex = Object.values(item.effects as Effect[]).findIndex(e =>
                                    (e.description as string[]).some(desc => desc === effect.description[index]),
                                );
                                const firstEffectKey = Object.keys(item.effects)[firstEffectIndex];
                                const firstIndex = item.effects[firstEffectKey].description.findIndex(
                                    (desc: string) => desc === effect.description[index],
                                );

                                values[
                                    createItemTranslationIdentifier(
                                        category,
                                        itemName,
                                        "effects",
                                        key,
                                        "description",
                                        index,
                                    )
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

        const targetDir = path.join(runConfig.i18nBaseDir, "en");

        const filepath = path.join(targetDir, "items.en.json");

        this.log(`Writing ${filepath}...`);

        fs.writeFileSync(filepath, JSON.stringify(values, null, "    "));

        sortJson.overwrite(filepath, sortJsonOptions);
    }
}
