import dataJson from "@json/data.json";

import { Armour } from "./Armour";
import { Cell } from "./Cell";
import { Lantern } from "./Lantern";
import { Omnicell } from "./Omnicell";
import { Part } from "./Part";
import { Perk } from "./Perks";
import { Weapon } from "./Weapon";

export type DauntlessBuilderDataIndex =
    | "armours"
    | "cells"
    | "lanterns"
    | "perks"
    | "weapons"
    | "parts"
    | "omnicells"
    | "misc";

export interface RegularWeaponParts {
    mods: {
        [name: string]: Part;
    };
    specials: {
        [name: string]: Part;
    };
}

export interface RepeaterParts {
    chambers: {
        [name: string]: Part;
    };
    grips: {
        [name: string]: Part;
    };
    mods: {
        [name: string]: Part;
    };
}

interface DauntlessBuilderData {
    armours: {
        [name: string]: Armour;
    };
    cells: {
        [name: string]: Cell;
    };
    lanterns: {
        [name: string]: Lantern;
    };
    perks: {
        [name: string]: Perk;
    };
    weapons: {
        [name: string]: Weapon;
    };
    parts: {
        aetherstrikers: RegularWeaponParts;
        axe: RegularWeaponParts;
        chainblades: RegularWeaponParts;
        hammer: RegularWeaponParts;
        sword: RegularWeaponParts;
        repeater: RepeaterParts;
        warpike: RegularWeaponParts;
    };
    omnicells: {
        [name: string]: Omnicell;
    };
    misc: {
        dauntless_version: string;
        patchnotes_version_string: string;
    };
}

const dauntlessBuilderData: DauntlessBuilderData = dataJson as unknown as DauntlessBuilderData;

export default dauntlessBuilderData;
