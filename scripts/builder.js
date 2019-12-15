const glob = require("glob");
const yaml = require("js-yaml");
const fs = require("fs");
const md5 = require("md5");
const Case = require("case");

let stringMap = {};
let stringCounter = {};

if(fs.existsSync(`./.map/names.json`)) {
    let data = fs.readFileSync(`./.map/names.json`);
    stringMap = JSON.parse(data);
}

function tryInsertToStringMap(category, string) {
    if (!stringMap[category]) {
        stringMap[category] = {};
    }

    if (!stringCounter[category]) {
        stringCounter[category] = 1;
    }

    let strings = Object.values(stringMap[category]);

    if (strings.indexOf(string) > -1) {
        return;
    }

    while (true) {
        if(Object.keys(stringMap[category]).indexOf(`${stringCounter[category]}`) === -1) {
            stringMap[category][stringCounter[category]] = string;
            console.log("Added " + string + " to " + category + " at " + stringCounter[category]);
            break;
        }

        stringCounter[category]++;
    }
}

function processPerks(perks) {
    return perks && perks.map(perk => Object.assign(perk, {name: Case.camel(perk.name)}));
}

const processUniqueEffects = uniqueEffects => uniqueEffects && uniqueEffects
    .map(effect => Object.assign(effect, {name: Case.camel(`${effect.name}${effect.from || 0}`), description: undefined}))

const processLanternAbility = lanternAbility => lanternAbility && {
    instant: !!lanternAbility.instant,
    hold: !!lanternAbility.hold
}

const processEffects = effects => effects && Object.entries(effects)
    .reduce((acc, [key, val]) => {
        delete val.description;
        return Object.assign(acc, {
            [key]: val
        });
    }, {});

function build(path) {
    return new Promise((resolve, reject) => {
        glob(path, (err, files) => {
            let data = {};

            for(let file of files) {
                console.log(file);
                let content = fs.readFileSync(file, "utf8");
                let doc = yaml.safeLoad(content);
                const segments = file.split("/")
                const filename = [...segments].pop().split(".").slice(0, -1).join(".")

                // it is a cell use variant names instead of name
                if(file.indexOf("/cells/") > -1) {
                    doc.name = Case.camel(doc.name);
                    if (doc.type) doc.type = Case.camel(doc.type);
                    for(let v of Object.keys(doc.variants)) {
                        const variant = doc.variants[v];
                        doc.variants[Case.camel(v)] = variant;
                        delete doc.variants[v];
                        for(let p of Object.keys(variant.perks)) {
                            const perk = variant.perks[p];
                            variant.perks[Case.camel(p)] = perk;
                            delete variant.perks[p];
                        }
                        tryInsertToStringMap("cells", Case.camel(v));
                    }

                    data[Case.camel(doc.name)] = doc;
                } else if(file.indexOf("/parts/") > -1) {
                    const parts = file.split("/");
                    const partsFolderIndex = parts.indexOf("parts");

                    const [weaponType, partType] = parts.slice(partsFolderIndex + 1);

                    if(!data[weaponType]) {
                        data[weaponType] = {};
                    }

                    if(!data[weaponType][partType]) {
                        data[weaponType][partType] = {};
                    }

                    doc.name = Case.camel(doc.name);
                    doc.part_effects = (doc.part_effect || []).length;
                    if (doc.part_effect) delete doc.part_effect;
                    data[weaponType][partType][doc.name] = doc;
                    tryInsertToStringMap(`parts:${Case.camel(weaponType).toLowerCase()}`, doc.name);
                } else if(file.indexOf("misc.yml") > -1) { // don't use string maps on misc
                    data = doc;
                } else {
                    doc.name = Case.camel(doc.name)
                    doc.perks = processPerks(doc.perks);
                    doc.unique_effects = processUniqueEffects(doc.unique_effects);
                    doc.lantern_ability = processLanternAbility(doc.lantern_ability);
                    doc.effects = processEffects(doc.effects);
                    if (doc.description) delete doc.description;
                    if (doc.type) doc.type = Case.camel(doc.type);
                    data[doc.name] = doc;
                    let type = doc.type;

                    if (file.indexOf("/perks/") > 0) {
                        type = "perks";
                    } else if (file.indexOf("/lanterns/") > 0) {
                        type = "lanterns";
                    } else if (file.indexOf("/weapons/") > 0) {
                        type = "weapons";
                    } else if (file.indexOf("/armours/") > 0) {
                        type = "armours";
                    }

                    tryInsertToStringMap(type, Case.camel(doc.name));
                }
            }

            resolve(data);
        });
    });
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function sortByKey(object) {
    let newObject = {};

    const sortedKeys = Object.keys(object).sort();

    for (let key of sortedKeys) {
        let value = object[key];

        if (typeof value === "object" && Object.keys(value).length > 0) {
            value = sortByKey(value);
        }

        newObject[key] = value;
    }

    return newObject;
}

Promise.all([
    build("data/armours/*/*.yml"),
    build("data/cells/*/*.yml"),
    build("data/lanterns/*.yml"),
    build("data/perks/*.yml"),
    build("data/weapons/*/*.yml"),
    build("data/parts/*/*/*.yml"),
    build("data/misc.yml")
]).then(data => {
    let objectCounter = 0;

    let object = {
        armours: data[objectCounter++],
        cells: data[objectCounter++],
        lanterns: data[objectCounter++],
        perks: data[objectCounter++],
        weapons: data[objectCounter++],
        parts: data[objectCounter++],
        misc: data[objectCounter++]
    };

    if(!fs.existsSync("./dist")) {
        fs.mkdirSync("./dist");
    }

    const dataString = JSON.stringify(object, null, 2);

    fs.writeFileSync("./dist/data.json", dataString);

    console.log("Built data.json");

    stringMap = sortByKey(stringMap);

    const mapString = JSON.stringify(stringMap);

    fs.writeFileSync(`./.map/names.json`, mapString);

    fs.writeFileSync("./dist/meta.json", JSON.stringify({
        "build_time": new Date().getTime(),
        "data_hash": md5(dataString),
        "map_hash": md5(mapString)
    }));

    const num = Object.keys(stringMap)
        .map(key => Object.keys(stringMap[key]).length)
        .reduce((a, b) => a + b);

    console.log("Build string map with " + num + " entries.");
});
