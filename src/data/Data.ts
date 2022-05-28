import dataJson from "../../dist/data.json";
import {Armour} from "./Armour";
import {Cell} from "./Cell";
import {Lantern} from "./Lantern";
import {Part} from "./Part";
import {Perk} from "./Perks";
import {Weapon} from "./Weapon";

interface DauntlessBuilderData {
    armours: {
        [name: string]: Armour,
    };
    cells: {
        [name: string]: Cell,
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
        aetherstrikers: {
            mods: {
                [name: string]: Part;
            };
            specials: {
                [name: string]: Part;
            };
        };
        axe: {
            mods: {
                [name: string]: Part;
            };
            specials: {
                [name: string]: Part;
            };
        };
        chainblades: {
            mods: {
                [name: string]: Part;
            };
            specials: {
                [name: string]: Part;
            };
        };
        hammer: {
            mods: {
                [name: string]: Part;
            };
            specials: {
                [name: string]: Part;
            };
        }
        repeater: {
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
    },
    misc: {
        dauntless_version: string;
        patchnotes_version_string: string;
    }
}

const dauntlessBuilderData: DauntlessBuilderData = dataJson;

export default dauntlessBuilderData;
