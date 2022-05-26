import {Language} from "../i18n";
import {CellType} from "./Cell";

export interface Lantern {
    name: string;
    icon: string;
    description: string|null;
    cells: CellType|CellType[]|null;
    lantern_ability: {
        instant: string|null;
        hold: string;
    }

    i18n?: {
        [language in Language]: {
            name?: string;
            description?: string;
            lantern_ability?: {
                instant?: string;
                hold?: string;
            }
        }
    }
}
