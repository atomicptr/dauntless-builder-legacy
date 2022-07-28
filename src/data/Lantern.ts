import { CellType } from "./Cell";

export interface Lantern {
    name: string;
    icon: string;
    description: string | null;
    cells: CellType | CellType[] | null;
    lantern_ability: {
        instant: string | null;
        hold: string;
    };
    values: {
        [key: string]: number;
    };
}
