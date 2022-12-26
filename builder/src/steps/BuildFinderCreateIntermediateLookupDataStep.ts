import * as fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

enum CellType {
    Prismatic = "Prismatic",
    Alacrity = "Alacrity",
    Brutality = "Brutality",
    Finesse = "Finesse",
    Fortitude = "Fortitude",
    Insight = "Insight",
}

interface PerkValue {
    name: string;
    value: number;
    powerSurged?: boolean;
}

interface Armour {
    name: string;
    type: ArmourType;
    cells: CellType[];
    perks?: PerkValue[];
}

interface Data {
    armours: {
        [name: string]: Armour;
    };
}

enum ArmourType {
    Torso = "Torso",
    Arms = "Arms",
    Head = "Head",
    Legs = "Legs",
}

type ArmourDataCells = {
    [armourType in ArmourType]: {
        [cellType in CellType]: Armour[];
    };
};

type ArmourData = {
    [armourType in ArmourType]: {
        [perkName: string]: {
            [cellType in CellType]: Armour[];
        };
    };
};

export class BuildFinderCreateIntermediateLookupDataStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    name(): string {
        return "armour-data";
    }

    async run(runConfig: RunConfig): Promise<void> {
        const dataJsonPath = path.join(runConfig.publicDir, "data.json");

        if (!fs.existsSync(dataJsonPath)) {
            this.fatal(`${dataJsonPath} does not exist, run data step first!`);
        }

        const data: {
            armours: {
                [name: string]: Armour;
            };
        } = JSON.parse(fs.readFileSync(dataJsonPath).toString());

        const filepath = path.join(runConfig.targetDir, "build_finder_intermediate_lookup_data.json");

        this.log(`Writing ${filepath}...`);

        fs.writeFileSync(filepath, JSON.stringify(this.generateArmourData(data), null, "    "));

        sortJson.overwrite(filepath, sortJsonOptions);

        const filepath2 = path.join(runConfig.targetDir, "build_finder_intermediate_lookup_data_cells.json");

        this.log(`Writing ${filepath2}...`);

        fs.writeFileSync(filepath2, JSON.stringify(this.generateArmourDataCells(data), null, "    "));

        sortJson.overwrite(filepath2, sortJsonOptions);
    }

    private findArmourPiecesByType(type: ArmourType, data: Data) {
        return Object.values(data.armours).filter(armourPiece => armourPiece.type === type);
    }

    private cellToArmourArray() {
        return {
            [CellType.Prismatic]: [] as Armour[],
            [CellType.Alacrity]: [] as Armour[],
            [CellType.Brutality]: [] as Armour[],
            [CellType.Finesse]: [] as Armour[],
            [CellType.Fortitude]: [] as Armour[],
            [CellType.Insight]: [] as Armour[],
        };
    }

    private generateArmourData = (data: Data): ArmourData => {
        let armourData: ArmourData | null = null;
        if (armourData !== null) {
            return armourData;
        }

        const addArmour = (armourType: ArmourType, perkName: string, cellType: CellType, armour: Armour) => {
            if (armourData == null) {
                armourData = {
                    [ArmourType.Head]: {},
                    [ArmourType.Torso]: {},
                    [ArmourType.Arms]: {},
                    [ArmourType.Legs]: {},
                };
            }

            if (!(perkName in armourData[armourType])) {
                armourData[armourType][perkName] = this.cellToArmourArray();
            }

            armourData[armourType][perkName][cellType].push(armour);
        };

        const addArmours = (armourType: ArmourType) => {
            for (const armour of this.findArmourPiecesByType(armourType, data)) {
                if (!armour.cells) {
                    continue;
                }

                (Array.isArray(armour.cells) ? armour.cells : [armour.cells]).forEach(cell => {
                    if (armour.perks) {
                        addArmour(armourType, armour.perks[0].name, cell, armour);
                    }
                });
            }
        };

        addArmours(ArmourType.Head);
        addArmours(ArmourType.Torso);
        addArmours(ArmourType.Arms);
        addArmours(ArmourType.Legs);
        return armourData as unknown as ArmourData;
    };

    private generateArmourDataCells(data: Data) {
        let armourDataCells: ArmourDataCells | null = null;
        if (armourDataCells !== null) {
            return armourDataCells;
        }

        const addArmour = (armourType: ArmourType, cellType: CellType, armour: Armour) => {
            if (armourDataCells == null) {
                armourDataCells = {
                    [ArmourType.Head]: this.cellToArmourArray(),
                    [ArmourType.Torso]: this.cellToArmourArray(),
                    [ArmourType.Arms]: this.cellToArmourArray(),
                    [ArmourType.Legs]: this.cellToArmourArray(),
                };
            }

            armourDataCells[armourType][cellType].push(armour);
        };

        const addArmours = (armourType: ArmourType) => {
            for (const armour of this.findArmourPiecesByType(armourType, data)) {
                if (!armour.cells) {
                    continue;
                }

                (Array.isArray(armour.cells) ? armour.cells : [armour.cells]).forEach(cell => {
                    if (armour.perks) {
                        addArmour(armourType, cell, armour);
                    }
                });
            }
        };

        addArmours(ArmourType.Head);
        addArmours(ArmourType.Torso);
        addArmours(ArmourType.Arms);
        addArmours(ArmourType.Legs);
        return armourDataCells as unknown as ArmourDataCells; //heads[ArmourType.Head]["Aetheric Attunement"][CellType.Insight]
    }
}
