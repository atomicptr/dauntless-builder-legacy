import glob from "glob";
import fs from "fs";

const languageRegex = /([a-z]{2})\.json$/;

const filesPattern = "src/translations/*.json"; // TODO: change it to "src/translations/**/*.json" with flag to display items or not

const translationFiles = glob.sync(filesPattern).filter(file => languageRegex.test(file));

const languageKeys = {};
const missingKeys = {};

const flattenObject = (object, parent, result = {}) => {
    for (const key of Object.keys(object)) {
        const propertyName = parent ? `${parent}.${key}` : key;

        if (typeof object[key] === "object" && object[key] !== null) {
            flattenObject(object[key], propertyName, result);
            continue;
        }

        result[propertyName] = object[key];
    }
    return result;
};

translationFiles.forEach(file => {
    const res = languageRegex.exec(file);
    const lang = res[1];

    if (!(lang in languageKeys)) {
        languageKeys[lang] = {};
        missingKeys[lang] = [];
    }

    const data = fs.readFileSync(file);
    const json = flattenObject(JSON.parse(data));

    Object.keys(json).forEach(key => (languageKeys[lang][key] = json[key]));
});

for (const lang1 of Object.keys(languageKeys)) {
    for (const lang2 of Object.keys(languageKeys)) {
        if (lang1 === lang2) {
            continue;
        }

        for (const key of Object.keys(languageKeys[lang2])) {
            if (!(key in languageKeys[lang1])) {
                missingKeys[lang1].push(key);
            }
        }
    }
}

let missing = false;

for (const lang of Object.keys(missingKeys)) {
    const keys = missingKeys[lang];

    if (keys.length === 0) {
        continue;
    }

    missing = true;

    for (const key of keys) {
        console.log(`${lang}: \"${key}\" missing`);
    }

    console.log("");
}

process.exit(Number(missing));
