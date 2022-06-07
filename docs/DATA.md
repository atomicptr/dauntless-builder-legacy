# Data Documentation

## Parsing builds

Builds are not stored on a server, but instead stored in your address bar. If we take a look at the following

Dauntless Builder URL: `https://www.dauntless-builder.com/b/axfWTxZIOCKVimPCjcWtgT0Sm5I3C08fdPcpCE2Urbc2CjmHzjhnCvOc7SPNtw`

You can see a very long cryptic string at the end in this case **axfWTxZIOCKVimPCjcWtgT0Sm5I3C08fdPcpCE2Urbc2CjmHzjhnCvOc7SPNtw**,
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

TODO...
