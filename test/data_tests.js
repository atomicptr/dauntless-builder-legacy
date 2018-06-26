const assert = require("assert");
const request = require("request");
const fs = require("fs");
const path = require("path");

const remoteMapUrls = {
    v1: "https://raw.githubusercontent.com/atomicptr/dauntless-builder/master/.map/v1.json"
};

const localMap = {
    v1: JSON.parse(fs.readFileSync("./.map/v1.json"))
};

const data = JSON.parse(fs.readFileSync("./dist/data.json"))

describe("Dauntless Builder Data", () => {
    describe("Validity of map", () => {

        it("should not change currently used IDs", done => {
            request.get(remoteMapUrls.v1, (err, res, body) => {
                if(err) {
                    throw err;
                }

                let remoteMap = JSON.parse(body);

                Object.keys(remoteMap).forEach(key => {
                    assert.equal(remoteMap[key], localMap.v1[key], `Key: ${key} should be the same`);
                });

                done();
            });
        });

        const checkIfItemIsInDataFor = (field, checkFunction) => {
            if(!checkFunction) {
                checkFunction = itemName => Object.values(localMap.v1).indexOf(itemName) > -1;
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
            Object.keys(data.cells[cellName].variants).every(variant => Object.values(localMap.v1).indexOf(variant) > -1)));
    });

    describe("Validity of built data", () => {
        const checkIconsFor = field => {
            return () => {
                for(let itemName in data[field]) {
                    let item = data[field][itemName];

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
        it("Armours should not have invalid icons", checkIconsFor("armours"));
    })
});