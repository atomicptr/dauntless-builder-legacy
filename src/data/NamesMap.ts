export enum NamesMapType {
    Weapon = "Weapons",
    Cell = "Cells",
    Armour = "Armours",
    Lantern = "Lanterns",
    Omnicell = "Omnicells",
    AetherstrikerPart = "Parts:Aetherstrikers",
    AxePart = "Parts:Axe",
    ChainbladesPart = "Parts:Chainblades",
    HammerPart = "Parts:Hammer",
    RepeaterPart = "Parts:Repeater",
    SwordPart = "Parts:Sword",
    WarpikePart = "Parts:Warpike",
}

export type NamesMap = {
    [type in NamesMapType]: {
        [id: string]: string;
    };
};

import namesJson from "@map/names.json";

const dauntlessBuilderNamesMap: NamesMap = namesJson;

export default dauntlessBuilderNamesMap;
