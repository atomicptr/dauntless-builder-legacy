const assert = require("assert");
const Hashids = require("hashids");

const hashids = new Hashids("spicy");

const stringMap = require("../.map/v1.json");

function makeBuild(buildId) {
    const numbers = hashids.decode(buildId);

    let idcounter = 0;

    return {
        __version: numbers[idcounter++],
        weapon_name: stringMap[numbers[idcounter++]],
        weapon_level: numbers[idcounter++],
        weapon_cell0: stringMap[numbers[idcounter++]],
        weapon_cell1: stringMap[numbers[idcounter++]],
        head_name: stringMap[numbers[idcounter++]],
        head_level: numbers[idcounter++],
        head_cell: stringMap[numbers[idcounter++]],
        torso_name: stringMap[numbers[idcounter++]],
        torso_level: numbers[idcounter++],
        torso_cell: stringMap[numbers[idcounter++]],
        arms_name: stringMap[numbers[idcounter++]],
        arms_level: numbers[idcounter++],
        arms_cell: stringMap[numbers[idcounter++]],
        legs_name: stringMap[numbers[idcounter++]],
        legs_level: numbers[idcounter++],
        legs_cell: stringMap[numbers[idcounter++]],
        lantern_name: stringMap[numbers[idcounter++]],
        lantern_cell: stringMap[numbers[idcounter++]]
    };
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
    it("should be able to deserialize", () => {
        // a random build that someone send me :)
        assertValid([
            ["r5C7H8iPeIY6HV8cwievsjdF6i35hNZt2i6zcBwtnizrCLjSZ3", [
                {field: "weapon_name", value: "Deadblades"},
                {field: "weapon_level", value: 10},
                {field: "weapon_cell0", value: "+3 Barbed Cell"},
                {field: "weapon_cell1", value: "+3 Nine Lives Cell"},
                {field: "head_name", value: "Deadeye Mask"},
                {field: "head_level", value: 10},
                {field: "head_cell", value: "+3 Nine Lives Cell"},
                {field: "torso_name", value: "Deadeye Jacket"},
                {field: "torso_level", value: 10},
                {field: "torso_cell", value: "+3 Savagery Cell"},
                {field: "arms_name", value: "Reza Grips"},
                {field: "arms_level", value: 10},
                {field: "arms_cell", value: "+3 Weighted Strikes Cell"},
                {field: "legs_name", value: "Deadeye Boots"},
                {field: "legs_level", value: 10},
                {field: "legs_cell", value: "+3 Weighted Strikes Cell"},
                {field: "lantern_name", value: "Pangar's Resolve"},
                {field: "lantern_cell", value: "+3 Aetherborne Cell"},
            ]],
            // TODO: add more items / build variations etc
        ])
    })
});