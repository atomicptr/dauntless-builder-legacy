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

        const lookupDataPath = path.join(runConfig.targetDir, "build-finder-intermediate-lookup-armour-data.json");

        this.log(`Writing ${lookupDataPath}...`);

        fs.writeFileSync(lookupDataPath, JSON.stringify(this.generateArmourData(data), null, "    "));

        const lookupDataCellsPath = path.join(
            runConfig.targetDir,
            "build-finder-intermediate-lookup-armour-data-cells.json",
        );

        this.log(`Writing ${lookupDataCellsPath}...`);

        fs.writeFileSync(lookupDataCellsPath, JSON.stringify(this.generateArmourDataCells(data), null, "    "));

        sortJson.overwrite([lookupDataPath, lookupDataCellsPath], sortJsonOptions);
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
        const armourData: ArmourData = {
            [ArmourType.Head]: {},
            [ArmourType.Torso]: {},
            [ArmourType.Arms]: {},
            [ArmourType.Legs]: {},
        };

        const addArmour = (armourType: ArmourType, perkName: string, cellType: CellType, armour: Armour) => {
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
        return armourData;
    };

    private generateArmourDataCells(data: Data) {
        const armourDataCells: ArmourDataCells = {
            [ArmourType.Head]: this.cellToArmourArray(),
            [ArmourType.Torso]: this.cellToArmourArray(),
            [ArmourType.Arms]: this.cellToArmourArray(),
            [ArmourType.Legs]: this.cellToArmourArray(),
        };

        const addArmour = (armourType: ArmourType, cellType: CellType, armour: Armour) => {
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
        return armourDataCells;
    }
}
