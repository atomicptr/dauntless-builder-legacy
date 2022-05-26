import dataJson from "../../dist/data.json";
import {Weapon} from "./Weapon";
import {Armour} from "./Armour";
import {Cell} from "./Cell";
import {Lantern} from "./Lantern";
import {Perk} from "./Perks";
import {Part} from "./Part";

interface Data {
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
    }
}

const data: Data = dataJson;

export default data;
