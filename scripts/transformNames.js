const fs = require('fs');
const Case = require('case');

const oldNames = require('../.map/names.json');
const newNames = {};

function camelify(section) {
    const newSection = {};
    for (let id in section) {
        newSection[id] = Case.camel(section[id])
    }
    return newSection;
}

for (let section in oldNames) {
    newNames[section.toLowerCase()] = camelify(oldNames[section])
}

fs.writeFileSync('.map/names.json', JSON.stringify(newNames, null, 2));