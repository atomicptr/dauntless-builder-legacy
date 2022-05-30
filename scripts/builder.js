import glob from "glob";
import yaml from "js-yaml";
import fs from "fs";
import md5 from "md5";

let stringMap = {};
let stringCounter = {};

if (fs.existsSync(`./.map/names.json`)) {
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
        if (Object.keys(stringMap[category]).indexOf(`${stringCounter[category]}`) === -1) {
            stringMap[category][stringCounter[category]] = string;
            console.log("Added " + string + " to " + category + " at " + stringCounter[category]);
            break;
        }

        stringCounter[category]++;
    }
}

function build(path) {
    return new Promise((resolve, reject) => {
        glob(path, (err, files) => {
            let data = {};

            for (let file of files) {
                let content = fs.readFileSync(file, "utf8");
                let doc = yaml.load(content);

                // it is a cell use variant names instead of name
                if (file.indexOf("/cells/") > -1) {
                    data[doc.name] = doc;

                    for (let v of Object.keys(doc.variants)) {
                        tryInsertToStringMap("Cells", v);
                    }
                } else if (file.indexOf("/parts/") > -1) {
                    const parts = file.split("/");
                    const partsFolderIndex = parts.indexOf("parts");

                    const [weaponType, partType] = parts.slice(partsFolderIndex + 1);

                    if (!data[weaponType]) {
                        data[weaponType] = {};
                    }

                    if (!data[weaponType][partType]) {
                        data[weaponType][partType] = {};
                    }

                    data[weaponType][partType][doc.name] = doc;
                    tryInsertToStringMap(`Parts:${ucfirst(weaponType)}`, doc.name);
                } else if (file.indexOf("misc.yml") > -1) {
                    // don't use string maps on misc
                    data = doc;
                } else {
                    data[doc.name] = doc;
                    let type = doc.type;

                    if (file.indexOf("/perks/") > 0) {
                        type = "Perks";
                    } else if (file.indexOf("/lanterns/") > 0) {
                        type = "Lanterns";
                    } else if (file.indexOf("/weapons/") > 0) {
                        type = "Weapons";
                    } else if (file.indexOf("/armours/") > 0) {
                        type = "Armours";
                    } else if (file.indexOf("/omnicells/") > 0) {
                        type = "Omnicells";
                    }

                    tryInsertToStringMap(type, doc.name);
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
    build("data/omnicells/*.yml"),
    build("data/misc.yml"),
]).then(data => {
    let objectCounter = 0;

    let object = {
        armours: data[objectCounter++],
        cells: data[objectCounter++],
        lanterns: data[objectCounter++],
        perks: data[objectCounter++],
        weapons: data[objectCounter++],
        parts: data[objectCounter++],
        omnicells: data[objectCounter++],
        misc: data[objectCounter++],
    };

    if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public");
    }

    const dataString = JSON.stringify(object);

    fs.writeFileSync("./public/data.json", dataString);

    console.log("Built data.json");

    stringMap = sortByKey(stringMap);

    // store a nicer version in the repository
    fs.writeFileSync(`./.map/names.json`, JSON.stringify(stringMap, null, "    ") + "\n");

    if (!fs.existsSync("./public/map")) {
        fs.mkdirSync("./public/map");
    }

    const mapString = JSON.stringify(stringMap);
    fs.writeFileSync(`./public/map/names.json`, mapString);

    fs.writeFileSync(
        "./public/meta.json",
        JSON.stringify({
            build_time: new Date().getTime(),
            data_hash: md5(dataString),
            map_hash: md5(mapString),
        }),
    );

    const num = Object.keys(stringMap)
        .map(key => Object.keys(stringMap[key]).length)
        .reduce((a, b) => a + b);

    console.log("Build string map with " + num + " entries.");
});
