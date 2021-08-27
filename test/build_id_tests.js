const assert = require("assert");
const Hashids = require("hashids");

const hashids = new Hashids("spicy");

const itemData = require("../dist/data.json");
const stringMap = require("../.map/names.json");

function makeBuild(buildId) {
    let numbers = hashids.decode(buildId);

    const getString = (type, counter) => {
        if (numbers[counter] === 0) {
            return "";
        }

        if (!(type in stringMap)) {
            return "";
        }

        return stringMap[type][numbers[counter]];
    };

    const findWeapon = name => {
        if(name in itemData.weapons) {
            return itemData.weapons[name];
        }

        return null;
    };

    const formatWeaponTypeForParts = weaponType => {
        if (!weaponType) {
            return "null";
        }

        const str = weaponType.toLowerCase().replace(" ", "");
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    let idcounter = 0;

    const version = numbers[idcounter++];

    const weaponName = getString("Weapons", idcounter++);
    const weapon = findWeapon(weaponName);
    const partsType = weapon ? `Parts:${formatWeaponTypeForParts(weapon.type)}` : null;

    let data = {
        __version: version,
        weapon_name: weaponName,
        weapon_level: numbers[idcounter++],
        weapon_cell0: getString("Cells", idcounter++),
        weapon_cell1: getString("Cells", idcounter++),
        weapon_part1_name: getString(partsType, idcounter++),
        weapon_part2_name: getString(partsType, idcounter++),
        weapon_part3_name: getString(partsType, idcounter++),
        bond_weapon_name: getString("Weapons", idcounter++),
        head_name: getString("Armours", idcounter++),
        head_level: numbers[idcounter++],
        head_cell: getString("Cells", idcounter++),
        torso_name: getString("Armours", idcounter++),
        torso_level: numbers[idcounter++],
        torso_cell: getString("Cells", idcounter++),
        arms_name: getString("Armours", idcounter++),
        arms_level: numbers[idcounter++],
        arms_cell: getString("Cells", idcounter++),
        legs_name: getString("Armours", idcounter++),
        legs_level: numbers[idcounter++],
        legs_cell: getString("Cells", idcounter++),
        lantern_name: getString("Lanterns", idcounter++),
        lantern_cell: getString("Cells", idcounter++),
        omnicell: getString("Omnicells", idcounter++),
    };

    return data;
}

function assertValid(data) {
    for(let [buildId, assertions] of data) {
        let build = makeBuild(buildId);

        for(let assertion of assertions) {
            assert.equal(
                build[assertion.field],
                assertion.value
            );
        }
    }
}

describe("Dauntless Builder - Build IDs", () => {
    it("should be able to deserialize builds", () => {
        // a random build that someone send me :)
        assertValid([
            ["a5cy2cZCKaHWPHMU6t3T6EUVLijC3eFMSdCPjSEbTbC14hkhvCnkHktePfP", [
                {field: "weapon_name", value: "Ice Breakers"},
                {field: "weapon_level", value: 1},
                {field: "weapon_part1_name", value: "Titan's Crash"},
                {field: "weapon_part2_name", value: "Cyclonic Strikeplate"},
                {field: "weapon_cell0", value: "+3 Berserker Cell"},
                {field: "weapon_cell1", value: "+3 Overpower Cell"},
                {field: "head_name", value: "Dark Watch"},
                {field: "head_level", value: 1},
                {field: "head_cell", value: "+3 Knockout King Cell"},
                {field: "torso_name", value: "Mantle of Thorns"},
                {field: "torso_level", value: 1},
                {field: "torso_cell", value: "+3 Conduit Cell"},
                {field: "arms_name", value: "Malkarion's Grasp"},
                {field: "arms_level", value: 1},
                {field: "arms_cell", value: "+3 Assassin's Frenzy Cell"},
                {field: "legs_name", value: "Volcanic Treads"},
                {field: "legs_level", value: 1},
                {field: "legs_cell", value: "+3 Overpower Cell"},
                {field: "lantern_name", value: "Embermane's Rapture"},
                {field: "lantern_cell", value: "+3 Conduit Cell"},
                {field: "omnicell", value: "Discipline"},
            ]]
            // TODO: add more items / build variations etc
        ])
    });
});
