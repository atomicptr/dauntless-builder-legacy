import * as fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

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

        enum ArmourType {
            Torso = "Torso",
            Arms = "Arms",
            Head = "Head",
            Legs = "Legs",
        }

        const dataJsonPath = path.join(runConfig.publicDir, "data.json");

        if (!fs.existsSync(dataJsonPath)) {
            this.fatal(`${dataJsonPath} does not exist, run data step first!`);
        }

        const data: {
            armours: {
                [name: string]: Armour;
            };
        } = JSON.parse(fs.readFileSync(dataJsonPath).toString());

        const findArmourPiecesByType = (type: ArmourType) => {
            return Object.values(data.armours).filter(armourPiece => armourPiece.type === type);
        };

        const cellToArmourArray = () => {
            return {
                [CellType.Prismatic]: [] as Armour[],
                [CellType.Alacrity]: [] as Armour[],
                [CellType.Brutality]: [] as Armour[],
                [CellType.Finesse]: [] as Armour[],
                [CellType.Fortitude]: [] as Armour[],
                [CellType.Insight]: [] as Armour[],
            };
        };

        type ArmourDataCells = {
            [armourType in ArmourType]: {
                [cellType in CellType]: Armour[];
            };
        };

        let armourDataCells: ArmourDataCells | null = null;

        const generateArmourDataCells = (): ArmourDataCells => {
            if (armourDataCells !== null) {
                return armourDataCells;
            }

            const addArmour = (armourType: ArmourType, cellType: CellType, armour: Armour) => {
                if (armourDataCells == null) {
                    armourDataCells = {
                        [ArmourType.Head]: cellToArmourArray(),
                        [ArmourType.Torso]: cellToArmourArray(),
                        [ArmourType.Arms]: cellToArmourArray(),
                        [ArmourType.Legs]: cellToArmourArray(),
                    };
                }

                armourDataCells[armourType][cellType].push(armour);
            };

            const addArmours = (armourType: ArmourType) => {
                for (const armour of findArmourPiecesByType(armourType)) {
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
        };

        type ArmourData = {
            [armourType in ArmourType]: {
                [perkName: string]: {
                    [cellType in CellType]: Armour[];
                };
            };
        };

        let armourData: ArmourData | null = null;

        const generateArmourData = (): ArmourData => {
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
                    armourData[armourType][perkName] = cellToArmourArray();
                }

                armourData[armourType][perkName][cellType].push(armour);
            };

            const addArmours = (armourType: ArmourType) => {
                for (const armour of findArmourPiecesByType(armourType)) {
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
            return armourData as unknown as ArmourData; //heads[ArmourType.Head]["Aetheric Attunement"][CellType.Insight]
        };

        const filepath = path.join(runConfig.targetDir, "build_finder_intermediate_lookup_data.json");

        this.log(`Writing ${filepath}...`);

        fs.writeFileSync(filepath, JSON.stringify(generateArmourData(), null, "    "));

        const filepath2 = path.join(runConfig.targetDir, "build_finder_intermediate_lookup_data_cells.json");

        this.log(`Writing ${filepath}...`);

        fs.writeFileSync(filepath2, JSON.stringify(generateArmourDataCells(), null, "    "));
        sortJson.overwrite(filepath, sortJsonOptions);
        sortJson.overwrite(filepath2, sortJsonOptions);
    }
}
