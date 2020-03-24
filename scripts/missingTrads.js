const flatten = require("flat");
const fs = require("fs");
const path = require("path");

const deepTypes = obj => {
    const type = typeof obj;
    switch (type) {
        case "object":
            if (obj instanceof Array) {
                return "array";
            }
            return Object.entries(obj).reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [key]: deepTypes(value)
                }),
                {}
            );
        default:
            return type;
    }
};

function toMatchWithTypes(received, ref) {
    const ensToTest = flatten(deepTypes(received));
    const ensRef = flatten(deepTypes(ref));
    const flatRef = flatten(ref);

    const missingKeys = Object.keys(ensRef).filter(
        it => !Object.keys(ensToTest).includes(it)
    );

    const wrongType = Object.keys(ensToTest).filter(
        it => ensRef[it] && ensToTest[it] !== ensRef[it]
    );

    return flatten.unflatten(
        missingKeys.concat(wrongType).reduce(
            (acc, it) =>
                Object.assign(acc, {
                    [it]: flatRef[it]
                }),
            {}
        )
    );

    // return {
    //     message: () => "Has keys and types corresponding",
    //     pass: true
    // };
}

const i18n = {
    fr: require("../i18n/fr/game.json"),
    en: require("../i18n/en/game.json")
};
const REF = "en"; // take english as REF

const safeLang = name => (Object.keys(i18n).includes(name) ? name : null);
const getLang = name => {
    const lang = safeLang(name);
    return lang ? i18n[lang] : null;
};

const { [REF]: refLang, ...others } = i18n;

Object.keys(others).forEach(lang => {
    const toTest = getLang(lang);

    const res = toMatchWithTypes(toTest, refLang);

    fs.writeFileSync(
        path.join(__dirname, "..", "out.json"),
        JSON.stringify(res, null, 4)
    );
});
