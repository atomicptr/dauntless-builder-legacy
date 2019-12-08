const fs = require("fs").promises;
const Case = require("case");

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

function process1(object) {
    const data = {}

    for (let itemName in object) {
        const doc = object[itemName];

        data[Case.camel(itemName)] = {
            name: doc.name,
            description: doc.description || " ",
            ...processUniqueEffects(doc.unique_effects),
            ...processLanternAbility(doc.lantern_ability),
            ...processEffects(doc.effects)
        };
    }

    return data;
}

function processCells(object) {
    const data = {};

    for (let cellName in object) {
        const doc = object[cellName];

        data[Case.camel(doc.name)] = doc.name;
        for(let v of Object.keys(doc.variants)) {
            data[Case.camel(v)] = v;
        }
    }

    return data;
}

function processPart(object) {
    const data = {};

    for (let partType in object) {
        const doc = object[partType];
    }

    return data;
}

function processParts(object) {
    const data = {};

    for (let _weaponType in object) {
        const weaponType = object[_weaponType];
        console.log(_weaponType);
        for (let _partType in weaponType) {
            const partType = weaponType[_partType];
            console.log(_partType);
            for (let _mod in partType) {
                const mod = partType[_mod];

                if(!data[_weaponType]) {
                    data[_weaponType] = {};
                }

                if(!data[_weaponType][_partType]) {
                    data[_weaponType][_partType] = {};
                }

                data[_weaponType][_partType][Case.camel(_mod)] = {
                    name: mod.name,
                    ...processPartEffect(mod.part_effect)
                };
            }
        }
    }

    return data;
}

(async function() {
    const fr = await fs.readFile("./i18n/fr/dauntless-builder-data-fr-translated-V.2 (1).json");
    const obj = JSON.parse(fr);

    const newObj = {
        armours: process1(obj.armours),
        cells: processCells(obj.cells),
        lanterns: process1(obj.lanterns),
        perks: process1(obj.perks),
        weapons: process1(obj.weapons),
        parts: processParts(obj.parts)
    }

    await fs.writeFile("./i18n/fr/game.json", JSON.stringify(newObj, null, 2));
})()
    .catch(console.error);