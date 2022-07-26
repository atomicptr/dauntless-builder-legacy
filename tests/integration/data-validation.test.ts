/**
 * @jest-environment node
 */
import namesJson from "@map/names.json";
import { GenericItem } from "@src/components/GenericItemSelectDialog";
import dauntlessBuilderData, { DauntlessBuilderDataIndex } from "@src/data/Data";
import { NamesMap, NamesMapType } from "@src/data/NamesMap";
import SchemaValidator from "ajv";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Armour } from "../../src/data/Armour";
import { findItem } from "../../src/data/BuildModel";
import { Cell, CellType } from "../../src/data/Cell";
import { ElementalType } from "../../src/data/ElementalType";
import { ItemType, itemTypeData } from "../../src/data/ItemType";
import { Lantern } from "../../src/data/Lantern";
import { Perk, PerkValue } from "../../src/data/Perks";
import { Weapon } from "../../src/data/Weapon";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localMap = namesJson as unknown as NamesMap;
const data = dauntlessBuilderData;

const chromeUserAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36";
const remoteMapUrl = "https://raw.githubusercontent.com/atomicptr/dauntless-builder/master/.map/names.json";

const fail = (message: string): never => {
    throw new Error(message);
};

describe(".map/names.json integrity", () => {
    it("should not change currently used IDs", async () => {
        const res = await axios.get(remoteMapUrl, {
            headers: {
                "User-Agent": chromeUserAgent,
            },
        });

        if (res.status !== 200) {
            fail(res.statusText);
        }

        const remoteMap = res.data;

        for (const mapName of Object.keys(remoteMap)) {
            const map = remoteMap[mapName];

            Object.keys(map).forEach(key => {
                if (!(mapName in localMap)) {
                    fail(`${mapName} is not in local map`);
                }

                try {
                    expect(map[key]).toBe(localMap[mapName as NamesMapType][key]);
                } catch (_e) {
                    fail(
                        `Key: ${mapName}.${key} should be the same value. Expected ${map[key]} found ${
                            localMap[mapName as NamesMapType][key]
                        }`,
                    );
                }
            });
        }
    });

    it("should not have vacancies", () => {
        for (const mapName of Object.keys(localMap)) {
            const map = localMap[mapName as NamesMapType];
            const size = Object.keys(map).length;

            for (let i = 1; i < size; i++) {
                try {
                    expect(map[i.toString()]).toBeTruthy();
                } catch (_e) {
                    fail(`${mapName} should have id: ${i}`);
                }
            }
        }
    });

    const checkIfItemIsInDataFor = (field: string, checkFunction?: (name: string) => boolean) => {
        if (!checkFunction) {
            checkFunction = itemName => {
                for (const mapName of Object.keys(localMap)) {
                    if (Object.values(localMap[mapName as NamesMapType]).indexOf(itemName) > -1) {
                        return true;
                    }
                }

                return false;
            };
        }

        return () => {
            for (const itemName in data[field as DauntlessBuilderDataIndex]) {
                try {
                    expect((checkFunction as (name: string) => boolean)(itemName)).toBeTruthy();
                } catch (_e) {
                    fail(`${itemName} is not in the map, rebuilt map to fix.`);
                }
            }
        };
    };

    it("should contain every weapon", checkIfItemIsInDataFor("weapons"));
    it("should contain every armour piece", checkIfItemIsInDataFor("armours"));
    it("should contain every lantern", checkIfItemIsInDataFor("lanterns"));
    it("should contain every perk", checkIfItemIsInDataFor("perks"));
    it(
        "should contain every cell",
        checkIfItemIsInDataFor("cells", cellName =>
            Object.keys(data.cells[cellName].variants).every(
                variant => Object.values(localMap["Cells"]).indexOf(variant) > -1,
            ),
        ),
    );
    it("should contain every omnicell", checkIfItemIsInDataFor("omnicells"));
});

describe("data.json integrity", () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const mineDataFromField = (data: any, field: string) => {
        const fieldParts = field.split(".");

        let dataWrapper = data;

        for (const part of fieldParts) {
            dataWrapper = dataWrapper[part];
        }

        return dataWrapper;
    };

    const checkIconsFor = (field: string, alternativeIconFieldName?: string) => {
        const iconFieldName = alternativeIconFieldName ? alternativeIconFieldName : "icon";
        return () => {
            const dataWrapper = mineDataFromField(data, field);

            for (const itemName in dataWrapper) {
                const item = dataWrapper[itemName];

                if (item.icon) {
                    const iconPath = path.join(process.cwd(), "public", item[iconFieldName]);

                    try {
                        expect(fs.existsSync(iconPath)).toBeTruthy();
                    } catch (_e) {
                        fail(`${item.name}'s icon doesn't exist: "${iconPath}".`);
                    }
                }
            }
        };
    };

    it("Weapons should not have invalid icons", checkIconsFor("weapons"));
    it("Axe Mods should not have invalid icons", checkIconsFor("parts.axe.mods"));
    it("Axe Specials should not have invalid icons", checkIconsFor("parts.axe.specials"));
    it("Chain Blades Mods should not have invalid icons", checkIconsFor("parts.chainblades.mods"));
    it("Chain Blades Specials should not have invalid icons", checkIconsFor("parts.chainblades.specials"));
    it("Hammer Mods should not have invalid icons", checkIconsFor("parts.hammer.mods"));
    it("Hammer Specials should not have invalid icons", checkIconsFor("parts.hammer.specials"));
    it("Sword Mods should not have invalid icons", checkIconsFor("parts.sword.mods"));
    it("Sword Specials should not have invalid icons", checkIconsFor("parts.sword.specials"));
    it("War Pike Mods should not have invalid icons", checkIconsFor("parts.warpike.mods"));
    it("War Pike Specials should not have invalid icons", checkIconsFor("parts.warpike.specials"));
    it("Aether Striker Mods should not have invalid icons", checkIconsFor("parts.aetherstrikers.mods"));
    it("Aether Striker Specials should not have invalid icons", checkIconsFor("parts.aetherstrikers.specials"));
    it("Armours should not have invalid icons", checkIconsFor("armours"));
    it("Repeater Chambers should not have invalid icons", checkIconsFor("parts.repeater.chambers"));
    it("Repeater Grips should not have invalid icons", checkIconsFor("parts.repeater.grips"));
    it("Repeater Mods should not have invalid icons", checkIconsFor("parts.repeater.mods"));
    it("Omnicells should not have invalid icons", checkIconsFor("omnicells"));
    it("Omnicells should not have ability invalid icons", checkIconsFor("omnicells", "ability_icon"));

    const checkCellSlotsFor = (itemType: ItemType) => {
        return () => {
            for (const itemName in itemTypeData(itemType)) {
                const item = findItem(itemType, itemName) as Weapon | Armour | Lantern;

                let cells = item.cells;

                if (cells === null) {
                    cells = [];
                }

                if (!Array.isArray(cells)) {
                    cells = [item.cells as CellType];
                }

                const slots = Object.keys(CellType);

                for (const cellSlot of slots) {
                    try {
                        expect(slots.indexOf(cellSlot) > -1).toBeTruthy();
                    } catch (_e) {
                        fail(
                            `${
                                item.name
                            } has an unknown cell slot type: "${cellSlot}", must be one of the following: ${slots.join(
                                ", ",
                            )}`,
                        );
                    }
                }
            }
        };
    };

    it("Weapons should not have invalid cell slots", checkCellSlotsFor(ItemType.Weapon));
    it("Armours should not have invalid cell slots", checkCellSlotsFor(ItemType.Head));
    it("Lanterns should not have invalid cell slots", checkCellSlotsFor(ItemType.Lantern));

    const checkElementsFor = (field: string) => {
        return () => {
            const dataWrapper = mineDataFromField(data, field);

            for (const itemName in dataWrapper) {
                const item = dataWrapper[itemName];

                const elements = Object.keys(ElementalType);

                let itemFields: string[] = [];

                if (field === "weapons") {
                    itemFields = ["elemental"];
                } else if (field === "armours") {
                    itemFields = ["strength", "weakness"];
                }

                const values = itemFields.map(field => item[field]);

                for (const value of values) {
                    if (value) {
                        try {
                            expect(elements.indexOf(value) > -1).toBeTruthy();
                        } catch (_e) {
                            fail(
                                `${
                                    item.name
                                } has an unknown element: "${value}", must be one of the following: ${elements.join(
                                    ", ",
                                )}`,
                            );
                        }
                    }
                }
            }
        };
    };

    it("Weapons should not have invalid elements", checkElementsFor("weapons"));
    it("Armours should not have invalid elements", checkElementsFor("armours"));

    const checkPerksFor = (
        itemType: ItemType,
        getPerksFunc: (item: { name: string; perks: PerkValue[] }) => string[],
    ) => {
        return () => {
            for (const itemName in itemTypeData(itemType)) {
                const item = findItem(itemType, itemName) as { name: string; perks: PerkValue[] };

                const perks = getPerksFunc(item);

                for (const perk of perks) {
                    try {
                        expect(perk in data.perks).toBeTruthy();
                    } catch (_e) {
                        fail(`${item.name} has an unknown perk: "${perk}".`);
                    }
                }
            }
        };
    };

    it(
        "Weapons should not have invalid perks",
        checkPerksFor(ItemType.Weapon, item => (item.perks ? item.perks.map(p => p.name) : [])),
    );

    it(
        "Armours should not have invalid perks",
        checkPerksFor(ItemType.Head, item => (item.perks ? item.perks.map(p => p.name) : [])),
    );

    it(
        "Cells should not have invalid perks",
        checkPerksFor(ItemType.Cell, item => {
            const cell = item as unknown as Cell;

            const perks = [];

            for (const variantName in cell.variants) {
                const variant = cell.variants[variantName];
                for (const perkName in variant.perks) {
                    perks.push(perkName);
                }
            }

            return perks;
        }),
    );

    const checkIfHasValidSchema = (field: string, seperateSchemaField: string | null = null) => {
        const schemaField = seperateSchemaField ? seperateSchemaField : field;

        const pathParts = schemaField.split(".");

        // last part is filename
        pathParts[pathParts.length - 1] = pathParts[pathParts.length - 1] + ".json";

        const schemaPath = path.join(__dirname, "..", "..", "data", "_schemas", ...pathParts);

        if (!fs.existsSync(schemaPath)) {
            return () => {
                fail(`No schema found for ${field} at ${schemaPath}`);
            };
        }

        const validator = new SchemaValidator();
        const schema = JSON.parse(fs.readFileSync(schemaPath).toString());

        try {
            const dataWrapper = mineDataFromField(data, field);

            return () => {
                for (const itemName in dataWrapper) {
                    const item = dataWrapper[itemName];

                    try {
                        expect(validator.validate(schema, item)).toBeTruthy();
                    } catch (_e) {
                        fail(
                            `${
                                item.name
                            } does not confirm to the schema defined in ${schemaPath}: ${validator.errorsText()}`,
                        );
                    }
                }
            };
        } catch (ex) {
            return () => {
                throw ex;
            };
        }
    };

    it("Weapons format should have a valid schema", checkIfHasValidSchema("weapons"));
    it("Armours format should have a valid schema", checkIfHasValidSchema("armours"));
    it("Lanterns format should have a valid schema", checkIfHasValidSchema("lanterns"));
    it("Cells format should have a valid schema", checkIfHasValidSchema("cells"));
    it("Perks format should have a valid schema", checkIfHasValidSchema("perks"));
    it("Repeater Chambers format should have a valid schema", checkIfHasValidSchema("parts.repeater.chambers"));
    it("Repeater Grips format should have a valid schema", checkIfHasValidSchema("parts.repeater.grips"));
    it("Omnicells format should have a valid schema", checkIfHasValidSchema("omnicells"));

    // validate specials on all weapons
    it(
        "Axe Specials format should have a valid schema",
        checkIfHasValidSchema("parts.axe.specials", "parts.generic.specials"),
    );
    it(
        "Chain Blades Specials format should have a valid schema",
        checkIfHasValidSchema("parts.chainblades.specials", "parts.generic.specials"),
    );
    it(
        "Hammer Specials format should have a valid schema",
        checkIfHasValidSchema("parts.hammer.specials", "parts.generic.specials"),
    );
    it(
        "Swords Specials format should have a valid schema",
        checkIfHasValidSchema("parts.sword.specials", "parts.generic.specials"),
    );
    it(
        "War Pike Specials format should have a valid schema",
        checkIfHasValidSchema("parts.warpike.specials", "parts.generic.specials"),
    );
    it(
        "Aether Striker Specials format should have a valid schema",
        checkIfHasValidSchema("parts.aetherstrikers.specials", "parts.generic.specials"),
    );

    // validate mods on all weapons
    it("Axe Mods format should have a valid schema", checkIfHasValidSchema("parts.axe.mods", "parts.generic.mods"));
    it(
        "Chain Blades Mods format should have a valid schema",
        checkIfHasValidSchema("parts.chainblades.mods", "parts.generic.mods"),
    );
    it(
        "Hammer Mods format should have a valid schema",
        checkIfHasValidSchema("parts.hammer.mods", "parts.generic.mods"),
    );
    it(
        "Swords Mods format should have a valid schema",
        checkIfHasValidSchema("parts.sword.mods", "parts.generic.mods"),
    );
    it(
        "War Pike Mods format should have a valid schema",
        checkIfHasValidSchema("parts.warpike.mods", "parts.generic.mods"),
    );
    it(
        "Aether Striker Mods format should have a valid schema",
        checkIfHasValidSchema("parts.aetherstrikers.mods", "parts.generic.mods"),
    );
    it(
        "Repeater Mods format should have a valid schema",
        checkIfHasValidSchema("parts.repeater.mods", "parts.generic.mods"),
    );

    // validate if variables are unused
    const checkIfAllVariablesAreUsed = (field: string) => {
        const extractVars = (text: string) => {
            const vars = /{{([a-zA-Z0-9]+)}}/gm;
            const res = [...text.matchAll(vars)];
            return res.length > 0 ? res : null;
        };

        const checkForVariables = (item: GenericItem, text: string | string[], values: object) => {
            text = Array.isArray(text) ? text.join(" ") : text;

            const varsInText = extractVars(text);
            const hasValues = Object.keys(values).length > 0;

            if (varsInText === null && !hasValues) {
                return;
            }

            for (const variableKey of Object.keys(values)) {
                if (variableKey === "NL") {
                    continue;
                }

                const isDefined = varsInText?.find(v => v[1] === variableKey) !== undefined;
                if (!isDefined) {
                    fail(`${item.name} contains undefined variable: ${variableKey}`);
                }
            }

            for (const varMatch of varsInText ?? []) {
                const varName = varMatch[1];

                if (varName === "NL") {
                    continue;
                }

                const isDefined = Object.keys(values).find(valName => valName === varName);
                if (!isDefined) {
                    fail(`${item.name} contains undefined variable: ${varName}`);
                }
            }
        };

        return () => {
            const dataWrapper = mineDataFromField(data, field);

            for (const itemName in dataWrapper) {
                const item = dataWrapper[itemName];

                // weapon / armor
                if ("unique_effects" in item && Array.isArray(item.unique_effects)) {
                    for (const ue of item.unique_effects) {
                        checkForVariables(item, ue.description, ue.values ?? {});
                    }
                }

                // perks
                if ("effects" in item) {
                    for (const effect of Object.values((item as Perk).effects)) {
                        checkForVariables(item, effect.description, effect.values ?? {});
                    }
                }

                // parts
                if ("part_effect" in item) {
                    checkForVariables(item, item.part_effect, item.values ?? {});
                }
            }
        };
    };

    it("Weapons should not have unused variables", checkIfAllVariablesAreUsed("weapons"));
    it("Armour should not have unused variables", checkIfAllVariablesAreUsed("armours"));
    it("Perks should not have unused variables", checkIfAllVariablesAreUsed("perks"));

    it("Axe Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.axe.mods"));
    it("Axe Specials should not have unused variables", checkIfAllVariablesAreUsed("parts.axe.specials"));
    it("Chain Blades Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.chainblades.mods"));
    it(
        "Chain Blades Specials should not have unused variables",
        checkIfAllVariablesAreUsed("parts.chainblades.specials"),
    );
    it("Hammer Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.hammer.mods"));
    it("Hammer Specials should not have unused variables", checkIfAllVariablesAreUsed("parts.hammer.specials"));
    it("Swords Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.sword.mods"));
    it("Swords Specials should not have unused variables", checkIfAllVariablesAreUsed("parts.sword.specials"));
    it("War Pike Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.warpike.mods"));
    it("War Pike Specials should not have unused variables", checkIfAllVariablesAreUsed("parts.warpike.specials"));
    it("Aether Striker Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.aetherstrikers.mods"));
    it(
        "Aether Striker Specials should not have unused variables",
        checkIfAllVariablesAreUsed("parts.aetherstrikers.specials"),
    );
    it("Repeater Mods should not have unused variables", checkIfAllVariablesAreUsed("parts.repeater.mods"));
    it("Repeater Grips should not have unused variables", checkIfAllVariablesAreUsed("parts.repeater.grips"));
    it("Repeater Chambers should not have unused variables", checkIfAllVariablesAreUsed("parts.repeater.chambers"));

    // TODO: add omnicells
    // TODO: add lanterns
});
