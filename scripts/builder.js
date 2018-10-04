const glob = require("glob");
const yaml = require("js-yaml");
const fs = require("fs");
const pathlib = require("path");

// DO NOT CHANGE THIS
const stringVersion = 1;

let stringMap = {};
let stringCounter = 1; // 0 is empty value

if(fs.existsSync(`./.map/v${stringVersion}.json`)) {
    let data = fs.readFileSync(`./.map/v${stringVersion}.json`)
    stringMap = JSON.parse(data);
}

function tryInsertToStringMap(string) {
    let strings = Object.values(stringMap);

    if(strings.indexOf(string) > -1) {
        return;
    }

    while(true) {
        if(Object.keys(stringMap).indexOf(`${stringCounter}`) == -1) {
            stringMap[stringCounter] = string;
            console.log("Added " + string + " to " + stringCounter);
            break;
        }

        stringCounter++;
    }
}

function build(path) {
    return new Promise((resolve, reject) => {
        glob(path, (err, files) => {
            let data = {};

            for(let file of files) {
                let content = fs.readFileSync(file, "utf8");
                let doc = yaml.safeLoad(content);

                // it is a cell use variant names instead of name
                if(file.indexOf("/cells/") > -1) {
                    data[doc.name] = doc;

                    for(let v of Object.keys(doc.variants)) {
                        tryInsertToStringMap(v);
                    }
                } else if(file.indexOf("/parts/") > -1) {
                    const parts = file.split("/");
                    const partsFolderIndex = parts.indexOf("parts");

                    const [weaponType, partType] = parts.slice(partsFolderIndex + 1)

                    if(!data[weaponType]) {
                        data[weaponType] = {};
                    }

                    if(!data[weaponType][partType]) {
                        data[weaponType][partType] = {};
                    }

                    data[weaponType][partType][doc.name] = doc;
                    tryInsertToStringMap(doc.name);
                } else if(file.indexOf("misc.yml") > -1) { // don't use string maps on misc
                    data = doc;
                    data.build_time = new Date().getTime();
                } else {
                    data[doc.name] = doc;
                    tryInsertToStringMap(doc.name);
                }
            }

            resolve(data);
        });
    });
}

Promise.all([
    build("data/armours/*.yml"),
    build("data/behemoths/*.yml"),
    build("data/cells/*/*.yml"),
    build("data/lanterns/*.yml"),
    build("data/perks/*.yml"),
    build("data/weapons/*/*.yml"),
    build("data/parts/*/*/*.yml"),
    build("data/misc.yml")
]).then(data => {
    let object = {
        armours: data[0],
        behemoths: data[1],
        cells: data[2],
        lanterns: data[3],
        perks: data[4],
        weapons: data[5],
        parts: data[6],
        misc: data[7]
    }

    if(!fs.existsSync("./dist")) {
        fs.mkdirSync("./dist");
    }

    fs.writeFileSync("./dist/data.json", JSON.stringify(object));

    console.log("Built data.json");

    fs.writeFileSync(`./.map/v${stringVersion}.json`, JSON.stringify(stringMap));

    console.log("Build string map with " + Object.keys(stringMap).length + " entries.");
});
