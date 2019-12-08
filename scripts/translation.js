const fs = require("fs");
const glob = require("glob");
const Case = require("case");
const yaml = require("js-yaml");

const processUniqueEffects = uniqueEffect => uniqueEffect && uniqueEffect.reduce((acc, effect) => Object.assign(acc, {
    [Case.camel(`${effect.name}${effect.from || 0}`)]: {
        name: effect.name,
        description: effect.description
    }
}), {})

const processLanternAbility = lanternAbility => lanternAbility && {
    lanternAbility: {
        instant: lanternAbility.instant,
        hold: lanternAbility.hold
    }
};

const processEffects = effects => effects && {
    effects: Object.entries(effects)
        .reduce((acc, [id, val]) => Object.assign(acc, {
            [id]: [].concat(val.description).map(it => it || " ")
        }), {})
}

const processPartEffect = partEffect => partEffect && {
    partEffect: partEffect.reduce((acc, val, idx) => Object.assign(acc, {
        [idx]: val
    }), {})
};

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

                if (file.indexOf("/weapons/") > 0
                    || file.indexOf("/armours/") > 0
                    || file.indexOf("/lanterns/") > 0
                    || file.indexOf("/perks/") > 0) {
                    data[Case.camel(doc.name)] = {
                        name: doc.name,
                        description: doc.description || " ",
                        ...processUniqueEffects(doc.unique_effects),
                        ...processLanternAbility(doc.lantern_ability),
                        ...processEffects(doc.effects)
                    }
                } else if (file.indexOf("/cells/") > 0) {
                    data[Case.camel(doc.name)] = doc.name;
                    for(let v of Object.keys(doc.variants)) {
                        data[Case.camel(v)] = v;
                    }
                } else if (file.indexOf("/parts/") > 0) {
                    const parts = file.split("/");
                    const partsFolderIndex = parts.indexOf("parts");

                    const [weaponType, partType] = parts.slice(partsFolderIndex + 1);

                    if(!data[weaponType]) {
                        data[weaponType] = {};
                    }

                    if(!data[weaponType][partType]) {
                        data[weaponType][partType] = {};
                    }

                    data[weaponType][partType][Case.camel(doc.name)] = {
                        name: doc.name,
                        ...processPartEffect(doc.part_effect)
                    };
                }

                // it is a cell use variant names instead of name
                // if(file.indexOf("/cells/") > -1) {
                //     doc.name = Case.camel(doc.name);
                //     for(let v of Object.keys(doc.variants)) {
                //         const variant = doc.variants[v];
                //         doc.variants[Case.camel(v)] = variant;
                //         delete doc.variants[v];
                //         for(let p of Object.keys(variant.perks)) {
                //             const perk = variant.perks[p];
                //             variant.perks[Case.camel(p)] = perk;
                //             delete variant.perks[p];
                //         }
                //         tryInsertToStringMap("Cells", v);
                //     }

                //     data[Case.camel(doc.name)] = doc;
                // } else if(file.indexOf("/parts/") > -1) {
                //     const parts = file.split("/");
                //     const partsFolderIndex = parts.indexOf("parts");

                //     const [weaponType, partType] = parts.slice(partsFolderIndex + 1);

                //     if(!data[weaponType]) {
                //         data[weaponType] = {};
                //     }

                //     if(!data[weaponType][partType]) {
                //         data[weaponType][partType] = {};
                //     }

                //     doc.name = Case.camel(doc.name);
                //     data[weaponType][partType][doc.name] = doc;
                //     tryInsertToStringMap(`Parts:${ucfirst(weaponType)}`, doc.name);
                // } else if(file.indexOf("misc.yml") > -1) { // don't use string maps on misc
                //     data = doc;
                // } else {
                //     doc.name = Case.camel(doc.name)
                //     doc.perks = processPerks(doc.perks);
                //     data[doc.name] = doc;
                //     let type = doc.type;

                //     if (file.indexOf("/perks/") > 0) {
                //         type = "Perks";
                //     } else if (file.indexOf("/lanterns/") > 0) {
                //         type = "Lanterns";
                //     } else if (file.indexOf("/weapons/") > 0) {
                //         type = "Weapons";
                //     } else if (file.indexOf("/armours/") > 0) {
                //         type = "Armours";
                //     }

                //     tryInsertToStringMap(type, doc.name);
                // }
            }

            resolve(data);
        });
    });
}

Promise.all([
    build("data/armours/*/*.yml"),
    build("data/cells/*/*.yml"),
    build("data/lanterns/*.yml"),
    build("data/perks/*.yml"),
    build("data/weapons/*/*.yml"),
    build("data/parts/*/*/*.yml")
]).then(data => {
    let objectCounter = 0;
    const object = {
        armours: data[objectCounter++],
        cells: data[objectCounter++],
        lanterns: data[objectCounter++],
        perks: data[objectCounter++],
        weapons: data[objectCounter++],
        parts: data[objectCounter++]
    }

    const gameData = JSON.stringify(object, null, 2);
    fs.writeFileSync(`./i18n/en/game.json`, gameData);
})