const assert = require("assert");
const request = require("request");
const fs = require("fs");
const path = require("path");

const SchemaValidator = require("ajv");

const remoteMapUrl = "https://raw.githubusercontent.com/atomicptr/dauntless-builder/master/.map/names.json";

const localMap = JSON.parse(fs.readFileSync("./.map/names.json"));

const data = JSON.parse(fs.readFileSync("./dist/data.json"));

describe("Dauntless Builder Data", () => {
    describe("Validity of map", () => {

        it("should not change currently used IDs", done => {
            request.get(remoteMapUrl, (err, res, body) => {
                if(err) {
                    throw err;
                }

                let remoteMap = JSON.parse(body);

                for (let mapName of Object.keys(remoteMap)) {
                    let map = remoteMap[mapName];

                    Object.keys(map).forEach(key => {
                        assert.equal(map[key], localMap[mapName][key], `Key: ${key} should be the same`);
                    });
                }

                done();
            });
        });

        const checkIfItemIsInDataFor = (field, checkFunction) => {
            if(!checkFunction) {
                checkFunction = itemName => {
                    for (let mapName of Object.keys(localMap)) {
                        if (Object.values(localMap[mapName]).indexOf(itemName) > -1) {
                            return true;
                        }
                    }

                    return false;
                }
            }

            return () => {
                for(let itemName in data[field]) {
                    assert.ok(
                        checkFunction(itemName),
                        `${itemName} is not in the map, rebuilt map to fix.`
                    );
                }
            }
        }

        it("should contain every weapon", checkIfItemIsInDataFor("weapons"));
        it("should contain every armour piece", checkIfItemIsInDataFor("armours"));
        it("should contain every lantern", checkIfItemIsInDataFor("lanterns"));
        it("should contain every perk", checkIfItemIsInDataFor("perks"));
        it("should contain every cell", checkIfItemIsInDataFor("cells", cellName =>
            Object.keys(data.cells[cellName].variants).every(variant => Object.values(localMap["Cells"]).indexOf(variant) > -1)));
    });

    describe("Validity of built data", () => {
        const mineDataFromField = (data, field) => {
            const fieldParts = field.split(".");

            let dataWrapper = data;

            for(let part of fieldParts) {
                dataWrapper = dataWrapper[part];
            }

            return dataWrapper;
        }

        const checkIconsFor = field => {
            return () => {
                const dataWrapper = mineDataFromField(data, field);

                for(let itemName in dataWrapper) {
                    let item = dataWrapper[itemName];

                    if(item.icon) {
                        let iconPath = path.join(process.cwd(), item.icon);

                        assert.ok(
                            fs.existsSync(iconPath),
                            `${item.name}'s icon doesn't exist: "${iconPath}".`
                        );
                    }
                }
            }
        }

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
        it("Repeater Barrels should not have invalid icons", checkIconsFor("parts.repeater.barrels"));
        it("Repeater Chambers should not have invalid icons", checkIconsFor("parts.repeater.chambers"));
        it("Repeater Grips should not have invalid icons", checkIconsFor("parts.repeater.grips"));
        it("Repeater Prisms should not have invalid icons", checkIconsFor("parts.repeater.prisms"));
        it("Repeater Mods should not have invalid icons", checkIconsFor("parts.repeater.mods"));
        //it("Repeater Specials should not have invalid icons", checkIconsFor("parts.repeater.specials"));

        const checkCellSlotsFor = field => {
            return () => {
                for(let itemName in data[field]) {
                    let item = data[field][itemName];

                    let cells = item.cells;

                    if(!cells) {
                        cells = [];
                    }

                    if(!Array.isArray(cells)) {
                        cells = [item.cells];
                    }

                    const slots = ["Power", "Technique", "Defence", "Utility", "Mobility", "Prismatic"];

                    for(let cellSlot of cells) {
                        assert.ok(
                            slots.indexOf(cellSlot) > -1,
                            `${item.name} has an unknown cell slot type: "${cellSlot}", must be one of the following: ${slots.join(", ")}`
                        );
                    }
                }
            };
        }

        it("Weapons should not have invalid cell slots", checkCellSlotsFor("weapons"));
        it("Armours should not have invalid cell slots", checkCellSlotsFor("armours"));
        it("Lanterns should not have invalid cell slots", checkCellSlotsFor("lanterns"));

        const checkElementsFor = field => {
            return () => {
                const dataWrapper = mineDataFromField(data, field);

                for(let itemName in dataWrapper) {
                    let item = dataWrapper[itemName];

                    const elements = ["Blaze", "Frost", "Shock", "Terra", "Radiant", "Umbral"];

                    let itemFields = [];

                    if(field === "weapons") {
                        itemFields = ["elemental"]
                    } else if(field === "armours") {
                        itemFields = ["strength", "weakness"];
                    }

                    let values = itemFields.map(field => item[field]);

                    for(let value of values) {
                        if(value) {
                            assert.ok(
                                elements.indexOf(value) > -1,
                                `${item.name} has an unknown element: "${value}", must be one of the following: ${elements.join(", ")}`
                            );
                        }
                    }
                }
            }
        };

        it("Weapons should not have invalid elements", checkElementsFor("weapons"));
        it("Armours should not have invalid elements", checkElementsFor("armours"));
        it("Repeater Barrels should not have invalid elements", checkElementsFor("parts.repeater.barrels"));

        const checkPerksFor = (field, getPerksFunc) => {
            return () => {
                for(let itemName in data[field]) {
                    let item = data[field][itemName];

                    const perks = getPerksFunc(item);

                    for(let perk of perks) {
                        assert.ok(
                            perk in data.perks,
                            `${item.name} has an unknown perk: "${perk}".`
                        );
                    }
                }
            }
        }

        it("Weapons should not have invalid perks", checkPerksFor("weapons", item =>
            item.perks ? item.perks.map(p => p.name) : []
        ));

        it("Armours should not have invalid perks", checkPerksFor("armours", item =>
            item.perks ? item.perks.map(p => p.name) : []
        ));

        it("Cells should not have invalid perks", checkPerksFor("cells", item =>
            [].concat(...Object.keys(item.variants).map(v => Object.keys(item.variants[v].perks)))
        ));

        const checkIfHasValidSchema = (field, seperateSchemaField = null) => {
            const schemaField = seperateSchemaField ? seperateSchemaField : field;

            const pathParts = schemaField.split(".");

            // last part is filename
            pathParts[pathParts.length - 1] = pathParts[pathParts.length - 1] + ".json";

            const schemaPath = path.join(__dirname, `../schemas`, ...pathParts);

            if(!fs.existsSync(schemaPath)) {
                return () => {
                    assert.fail("No schema found for " + field);
                };
            }

            const validator = new SchemaValidator();
            const schema = JSON.parse(fs.readFileSync(schemaPath));

            try {
                const dataWrapper = mineDataFromField(data, field);

                return () => {
                    for(let itemName in dataWrapper) {
                        let item = dataWrapper[itemName];

                        assert.ok(
                            validator.validate(schema, item),
                            `${item.name} does not confirm to the schema defined in ${schemaPath}: ${validator.errorsText()}`
                        );
                    }
                }
            } catch (ex) {
                return () => {
                    assert.fail(ex);
                }
            }
        }

        it("Weapons format should have a valid schema", checkIfHasValidSchema("weapons"));
        it("Armours format should have a valid schema", checkIfHasValidSchema("armours"));
        it("Lanterns format should have a valid schema", checkIfHasValidSchema("lanterns"));
        it("Cells format should have a valid schema", checkIfHasValidSchema("cells"));
        it("Perks format should have a valid schema", checkIfHasValidSchema("perks"));
        it("Repeater Barrels format should have a valid schema", checkIfHasValidSchema("parts.repeater.barrels"));
        it("Repeater Chambers format should have a valid schema", checkIfHasValidSchema("parts.repeater.chambers"));
        it("Repeater Grips format should have a valid schema", checkIfHasValidSchema("parts.repeater.grips"));
        it("Repeater Prisms format should have a valid schema", checkIfHasValidSchema("parts.repeater.prisms"));

        // validate specials on all weapons
        it("Axe Specials format should have a valid schema", checkIfHasValidSchema("parts.axe.specials", "parts.generic.specials"));
        it("Chain Blades Specials format should have a valid schema", checkIfHasValidSchema("parts.chainblades.specials", "parts.generic.specials"));
        it("Hammer Specials format should have a valid schema", checkIfHasValidSchema("parts.hammer.specials", "parts.generic.specials"));
        it("Swords Specials format should have a valid schema", checkIfHasValidSchema("parts.sword.specials", "parts.generic.specials"));
        it("War Pike Specials format should have a valid schema", checkIfHasValidSchema("parts.warpike.specials", "parts.generic.specials"));
        it("Aether Striker Specials format should have a valid schema", checkIfHasValidSchema("parts.aetherstrikers.specials", "parts.generic.specials"));

        // validate mods on all weapons
        it("Axe Mods format should have a valid schema", checkIfHasValidSchema("parts.axe.mods", "parts.generic.mods"));
        it("Chain Blades Mods format should have a valid schema", checkIfHasValidSchema("parts.chainblades.mods", "parts.generic.mods"));
        it("Hammer Mods format should have a valid schema", checkIfHasValidSchema("parts.hammer.mods", "parts.generic.mods"));
        it("Swords Mods format should have a valid schema", checkIfHasValidSchema("parts.sword.mods", "parts.generic.mods"));
        it("War Pike Mods format should have a valid schema", checkIfHasValidSchema("parts.warpike.mods", "parts.generic.mods"));
        it("Aether Striker Mods format should have a valid schema", checkIfHasValidSchema("parts.aetherstrikers.mods", "parts.generic.mods"));
        it("Repeater Mods format should have a valid schema", checkIfHasValidSchema("parts.repeater.mods", "parts.generic.mods"));
    });
});
