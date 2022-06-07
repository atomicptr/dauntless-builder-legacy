# Data Documentation

## Parsing builds

Builds are not stored on a server, but instead stored in your address bar. If we take a look at the following

Dauntless Builder
URL: `https://www.dauntless-builder.com/b/axfWTxZIOCKVimPCjcWtgT0Sm5I3C08fdPcpCE2Urbc2CjmHzjhnCvOc7SPNtw`

You can see a very long cryptic string at the end in this case
**axfWTxZIOCKVimPCjcWtgT0Sm5I3C08fdPcpCE2Urbc2CjmHzjhnCvOc7SPNtw**,
this is what we call the **build id**.

### Parsing the build id

Build ids are powered by a library called [hashids](https://hashids.org/), which transforms an array of integers into
a string akin to what you can see above.

Lets start with a simple example:

```ts
import Hashids from "hashids";

// the aforementioned build id
const buildId = "axfWTxZIOCKVimPCjcWtgT0Sm5I3C08fdPcpCE2Urbc2CjmHzjhnCvOc7SPNtw";

// build ids are salted with the string "spicy", this is very important!
// Why spicy? Back in the olden days around the time where I started working
// on Dauntless Builder this was a fairly short lived meme related to a livestream
// where (back then CM) crash7800 ran around with a pepper flare and said spicy a few
// too many times afair.
const salt = "spicy";

// now we initialize hashids, nothing special...
const hashids = new Hashids(salt);

// now we decode the build id...
const data = hashids.decode(buildId);

// "data" should now contain a list of integers like you can see here:
console.log(data); // => [6, 0, 133, 1, 117, 99, 5, 2, 0, 7, 109, 1, 108, 75, 1, 87, 89, 1, 69, 107, 1, 186, 7, 105, 1]

// What are those numbers you ask? Well lets look at the following enum from src/data/BuildModel.ts
// Just to be clear: Every field in this enum refers to an index, Version being index 0 and WeaponSurged is 3.
// I'll now elaborate what every field:
enum BuildFields {
    // Internal: The version of the build format, currently at 6. Basically whenever either Phoenix Labs
    // decides to change something in a way that breaks the current format (introduction of parts back then
    // for instance, etc) we have to accomedate by adjusting the format and hopefully offering automatic
    // upgrade paths.
    Version, // = 0

    // Internal: A special section reserved for bit flags in order to mark the build somehow.
    // Currently there are two possible options:
    //    0001: UPGRADED_BUILD - Something changed and we had to replace/adjust items
    //    0010: INVALID_BUILD - Something changed and is no longer available so we had to remove it
    Flags, // = 1

    // The map name ID for the weapon, more on this later
    WeaponName, // = 2

    // Is the weapon power surged? 1 if yes, 0 if not
    WeaponSurged, // = 3

    // The map name ID for the first weapon cell
    WeaponCell1, // = 4

    // ...second weapon cell
    WeaponCell2, // = 5

    // ...first weapon part, usually the "Special" except for repeaters in which case this is the "Chamber"
    WeaponPart1, // = 6

    // ...second weapon part, usually the "Mod" except for repeaters in which case this is the "Grip"
    WeaponPart2, // = 7

    // unused for all weapons except repeaters in which case this contains the "Mod"
    WeaponPart3, // = 8

    // the bond weapon ID
    BondWeapon, // = 9

    // armour pieces work like the weapon just without the parts and only one cell slot
    HeadName, // = 10
    HeadSurged, // = 11
    HeadCell, // = 12
    TorsoName, // = 13
    TorsoSurged, // = 14
    TorsoCell, // = 15
    ArmsName, // = 16
    ArmsSurged, // = 17
    ArmsCell, // = 18
    LegsName, // = 19
    LegsSurged, // = 20
    LegsCell, // = 21
    Lantern, // = 22
    LanternCell, // = 23
    Omnicell, // = 24
}
```

OK. Now that we know what these strange numbers are, how do we know which item they represent?

For this information we need to look into the names.json which is a map that associates an ID with
the name of an item which we use as **the** identifier in the data later.

Lets look at the structure of the names.json first:

```json
{
    "Armours": {
        "1": "Boreal Epiphany",
        "2": "Boreal March",
        "3": "Boreal Might",
        "4": "Boreal Resolve",
        "5": "The Skullforge",
        "6": "Volcanic Aegis",
        "7": "..."
    },
    "Cells": {
        "1": "+1 Assassin's Vigour Cell",
        "2": "+2 Assassin's Vigour Cell",
        "3": "...."
    },
    "....": {}
}
```

As you can see every item category has its own IDs, so you have to keep that in mind.

To expand on our earlier example:

```ts
// right below the enum from earlier...

// I want to know what the name of the weapon is... how do i do this?
// First we need to pull the names.json data from Dauntless Builder
const namesMap = await fetch("https://www.dauntless-builder.com/map/names.json");

if (!namesMap.ok) {
    throw Error("TODO: Something went wrong, but I can't be bothered to fix this rn");
}

// lets convert it into a juicy json object
const namesJson = await namesMap.json();

// lets assign the id to a variable just to make this example overly clear
const weaponId = data[BuildFields.WeaponName];

// and now we can just print it:
console.log("Weapon Name:", namesJson["Weapons"][weaponId]); // => Incinerator's Song

// And voila! Thats how you get item names, which we'll need in the next step.
```

### Using the data

The Dauntless Builder item data is available at https://www.dauntless-builder.com/data.json

In this example we'll continue the example from the last section:

```ts
// first we'll fetch the data
const itemData = await fetch("https://www.dauntless-builder.com/data.json");

if (!itemData.ok) {
    throw Error("TODO: Something went wrong, but I can't be bothered to fix this rn");
}

const dataJson = await itemData.json();

// see the example above where these variables come from
const weaponName = namesJson["Weapons"][weaponId];

const weapon = dataJson["weapons"][weaponName];

// lets print the weapon
console.log("Weapon:", weapon);

// this is what stdout would look like...
const output = {
    name: "Incinerator's Song",
    description: "A Slayer's axe forged with Torgadoro trophies.",
    icon: "/assets/icons/weapons/torgadoro/IncineratorsSong.png",
    type: "Axe",
    damage: "Slashing",
    elemental: "Blaze",
    cells: ["Prismatic", "Prismatic"],
    power: {
        base: 100,
        powerSurged: 120,
    },
    bond: {
        elemental: "Blaze",
    },
    unique_effects: [
        {
            name: "TorgadoroLegendaryAbility",
            icon: "/assets/icons/abilities/TorgadoroLegendaryWeaponAbility.png",
            description:
                "Legendary Ability: Enter a rage, gaining new attacks for 15 seconds. Deals +25% damage when the target is below\n50% health. Usable once, but resets on Behemoth kill.\n",
        },
    ],
};
```

### Checking for changes

Under https://www.dauntless-builder.com/meta.json you can also find out when was the last time the data
set was generated (build_time) and an md5 hash to check against to see if your data is different.

Here is an example of this file:

```json
{
    "build_time": 1653743142838,
    "data_hash": "b4174f01954cc0136d9d01d3f51be92d",
    "map_hash": "3a1a54c45fc36ae9b68d55f95c9598de"
}
```

### Creating links to Dauntless Builder

This is fairly similar to "Parsing the build id" above, just in reverse.

Here is a short code snippet showing how this can be done:

```ts
import Hashids from "hashids";

const hashids = new Hashids("spicy");

const newBuild = [
    // the current version string, since we mostly update them on the fly (if possible) you don't
    // need to worry too much about this
    6,
    // flags, just set this to this is only for DB itself
    0,
    weaponId,
    Number(weaponSurged),
    weaponCell1Id,
    // ... you get the drill
];

// This should now be an array of integers similar to before.
// Now you can just call hashids again:
const buildId = hashids.encode(newBuild);

// attach it after /b/...
const linkToDauntlessBuilder = `https://www.dauntless-builder.com/b/${buildId}`;

// And thats pretty much it.
console.log(linkToDauntlessBuilder);
```
