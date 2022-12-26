import armourDataJson from "@json/build_finder_intermediate_lookup_data.json";
import armourDataCellsJson from "@json/build_finder_intermediate_lookup_data_cells.json";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel, findCellVariantByPerk, findLanternByName } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import { ItemRarity } from "@src/data/ItemRarity";
import { Lantern } from "@src/data/Lantern";
import { Perk } from "@src/data/Perks";
import { Weapon, WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/reducers/build-finder/build-finder-selection-slice";
import { deepCopy } from "@src/utils/deep-copy";
import sortObjectByKeys from "@src/utils/sort-object-by-keys";
import md5 from "md5";
import { match } from "ts-pattern";

// Since the lantern itself does not matter I decided to pre-pick Shrike's Zeal as the Shrike is DB mascot :).
const lanternName = "Shrike's Zeal";

interface IntermediateBuild {
    weapon: IntermediateItem;
    head: IntermediateItem;
    torso: IntermediateItem;
    arms: IntermediateItem;
    legs: IntermediateItem;
    lantern: IntermediateItem;
}

interface IntermediateItem {
    name: string;
    perks: string[];
    cellSlots: CellType[];
}

interface IntermediateMap {
    [itemName: string]: IntermediateItem;
}

interface CellsSlottedMap {
    weapon: (string | null)[];
    head: (string | null)[];
    torso: (string | null)[];
    arms: (string | null)[];
    legs: (string | null)[];
    lantern: (string | null)[];
}

export interface MatchingBuild {
    ident: string;
    build: IntermediateBuild;
    perks: AssignedPerkValue;
    cellsSlotted: CellsSlottedMap;
}

export interface FinderItemData {
    weapons: Weapon[];
    lantern: Lantern;
}

type ArmourData = {
    [armourType in ArmourType]: {
        [perkName: string]: {
            [cellType in CellType]: Armour[];
        };
    };
};

const armourData: ArmourData = armourDataJson as unknown as ArmourData;

type ArmourDataCells = {
    [armourType in ArmourType]: {
        [cellType in CellType]: Armour[];
    };
};

const armourDataCells: ArmourDataCells = armourDataCellsJson as unknown as ArmourDataCells;

export const perks = (() => {
    const perkByType = {
        [CellType.Alacrity]: [] as Perk[],
        [CellType.Brutality]: [] as Perk[],
        [CellType.Finesse]: [] as Perk[],
        [CellType.Fortitude]: [] as Perk[],
        [CellType.Insight]: [] as Perk[],
    };

    Object.values(dauntlessBuilderData.perks).map(perk => {
        perkByType[perk.type as keyof typeof perkByType].push(perk);
    });

    return perkByType;
})();

export const perkCellMap = (() => {
    const cellTypeByPerk: {
        [perkName: string]: CellType;
    } = {};

    Object.values(dauntlessBuilderData.perks).map(perk => {
        cellTypeByPerk[perk.name as keyof typeof cellTypeByPerk] = perk.type;
    });

    return cellTypeByPerk;
})();

export interface FinderItemDataOptions {
    removeExotics?: boolean;
    removeLegendary?: boolean;
    pickerWeapon?: Weapon | null;
    pickerHead?: Armour | null;
    pickerTorso?: Armour | null;
    pickerArms?: Armour | null;
    pickerLegs?: Armour | null;
}

const defaultFinderItemDataOptions: FinderItemDataOptions = {
    pickerArms: null,
    pickerHead: null,
    pickerLegs: null,
    pickerTorso: null,
    pickerWeapon: null,
    removeExotics: true,
    removeLegendary: true,
};

const bondWrapperSeparator = "//";

export const findArmourPiecesByType = (type: ArmourType, options: FinderItemDataOptions = {}) => {
    const finderOptions = Object.assign({}, defaultFinderItemDataOptions, options);
    return Object.values(dauntlessBuilderData.armours)
        .filter(armourPiece => armourPiece.type === type)
        .filter(armourPiece => (finderOptions.removeExotics ? armourPiece.rarity !== ItemRarity.Exotic : true));
};

const createItemData = (
    weaponType: WeaponType | null,
    lanternName: string,
    requestedPerks: AssignedPerkValue,
    options: FinderItemDataOptions = {},
): FinderItemData => {
    const finderOptions = Object.assign({}, defaultFinderItemDataOptions, options);

    const { pickerWeapon } = finderOptions;

    const filterPerksAndCells =
        (mode: (a: boolean, b: boolean) => boolean = orMode) =>
            (item: Weapon | Armour) =>
                mode(
                (item.perks && item.perks[0].name in requestedPerks) as boolean,
                ((item.cells &&
                    (Array.isArray(item.cells) ? item.cells : [item.cells]).some(
                        cellSlot => Object.values(perkCellMap).indexOf(cellSlot) > -1,
                    )) ||
                    (item.cells && item.cells.indexOf(CellType.Prismatic) > -1)) as boolean,
                );

    const createLegendaryWeaponBondWrapper = (weapon: Weapon): Weapon => {
        // legendaries disable so we don't need wrappers
        if (options.removeLegendary) {
            return weapon;
        }

        // picker weapon selected and it's not a legendary, don't create wrappers
        if (pickerWeapon && pickerWeapon.bond === undefined) {
            return weapon;
        }

        // can't bond exotics
        if (weapon.rarity === ItemRarity.Exotic) {
            return weapon;
        }

        // TODO: should there ever be multiple legendaries for an element this will not work correctly anymore
        const legendaryWeapon = Object.values(dauntlessBuilderData.weapons).find(
            w => w.type === weaponType && w.bond?.elemental === weapon.elemental,
        );

        if (!legendaryWeapon) {
            return weapon;
        }

        const wrapperWeapon = Object.assign({}, legendaryWeapon);

        wrapperWeapon.name += bondWrapperSeparator + weapon.name;
        wrapperWeapon.perks = weapon.perks;

        return wrapperWeapon;
    };

    const matchingWeapons = Object.values(dauntlessBuilderData.weapons)
        .filter(weapon => weapon.type === weaponType)
        .filter(weapon => weapon.bond === undefined)
        .filter(weapon => (finderOptions.removeExotics ? weapon.rarity !== ItemRarity.Exotic : true))
        .map(createLegendaryWeaponBondWrapper);

    return {
        lantern: findLanternByName(lanternName) as Lantern,
        weapons: pickerWeapon
            ? matchingWeapons.filter(weapon => weapon.name.startsWith(pickerWeapon.name))
            : matchingWeapons.filter(filterPerksAndCells()),
    };
};

export const findBuilds = (
    weaponType: WeaponType | null,
    requestedPerks: AssignedPerkValue,
    maxBuilds: number,
    options: FinderItemDataOptions = {},
) => {
    const finderOptions = Object.assign({}, defaultFinderItemDataOptions, options);
    const { pickerHead, pickerTorso, pickerArms, pickerLegs } = finderOptions;
    const itemData = createItemData(weaponType, lanternName, requestedPerks, options);

    type AssignedSlotValue = {
        [cellType in CellType]: number;
    };
    const requestedSlots: AssignedSlotValue = {
        [CellType.Prismatic]: 0,
        [CellType.Alacrity]: 0,
        [CellType.Brutality]: 0,
        [CellType.Finesse]: 0,
        [CellType.Fortitude]: 0,
        [CellType.Insight]: 0,
    };

    for (const perkName in requestedPerks) {
        const desiredValue = requestedPerks[perkName];
        if (requestedSlots[perkCellMap[perkName]]) {
            requestedSlots[perkCellMap[perkName]] += desiredValue / 3;
        } else {
            requestedSlots[perkCellMap[perkName]] = desiredValue / 3;
        }
    }

    const requestedPerksCurrent: AssignedPerkValue = deepCopy(requestedPerks);

    const determineBasePerks = (build: IntermediateBuild): AssignedPerkValue => {
        const perkStrings = Object.values(build)
            .map(type => type.perks)
            .flat(10);
        const perks: AssignedPerkValue = {};
        for (const perk of perkStrings) {
            if (!(perk in perks)) {
                perks[perk] = 0;
            }
            perks[perk] += 3;
        }
        return perks;
    };

    const evaluateBuild = (build: IntermediateBuild) => {
        const perks = determineBasePerks(build);
        const cellsSlotted: CellsSlottedMap = {
            arms: build.arms.cellSlots.map(() => null),
            head: build.head.cellSlots.map(() => null),
            lantern: build.lantern.cellSlots.map(() => null),
            legs: build.legs.cellSlots.map(() => null),
            torso: build.torso.cellSlots.map(() => null),
            weapon: build.weapon.cellSlots.map(() => null),
        };

        for (const perkName in requestedPerks) {
            const desiredValue = requestedPerks[perkName];

            // do we already have the desired amount? If yes, skip
            if (perks[perkName] >= desiredValue) {
                continue;
            }

            const perkCellType = perkCellMap[perkName];

            // this array exists to enforce the order in which cells are slotted
            const itemTypes = ["lantern", "head", "torso", "arms", "legs", "weapon"];

            for (const itemType of itemTypes) {
                const item = build[itemType as keyof IntermediateBuild];

                item.cellSlots.forEach((cellSlot, index) => {
                    // we've reached the desired state, stop
                    if (perks[perkName] >= desiredValue) {
                        return;
                    }

                    // cell slot is not empty anymore, skip
                    if (cellsSlotted[itemType as keyof typeof cellsSlotted][index] !== null) {
                        return;
                    }

                    // doesn't fit, skip
                    if (cellSlot !== CellType.Prismatic && cellSlot !== perkCellType) {
                        return;
                    }

                    cellsSlotted[itemType as keyof typeof cellsSlotted][index] = perkName;

                    if (!(perkName in perks)) {
                        perks[perkName] = 0;
                    }
                    perks[perkName] += 3;
                });
            }
        }

        const fulfillsCriteria = () => {
            for (const perk in requestedPerks) {
                const desiredValue = requestedPerks[perk];

                if (!(perk in perks)) {
                    return false;
                }

                if (perks[perk] < desiredValue) {
                    return false;
                }
            }
            return true;
        };

        return { cellsSlotted, fulfillsCriteria: fulfillsCriteria(), perks };
    };

    const intermediateMap: IntermediateMap = {};

    const createIntermediateFormat = (item: Weapon | Armour | Lantern): IntermediateItem => {
        if (item.name in intermediateMap) {
            return intermediateMap[item.name];
        }

        const format: IntermediateItem = {
            cellSlots: (Array.isArray(item.cells) ? item.cells : item.cells === null ? [] : [item.cells]) ?? [],
            name: item.name,
            perks:
                "perks" in item
                    ? (item.perks ?? [])
                        .map(perk => perk.name)
                        .filter((perk, index, self) => self.indexOf(perk) === index)
                    : [],
        };

        intermediateMap[item.name] = format;

        return format;
    };

    const findMatchingBuilds = () => {
        const matchingBuilds: MatchingBuild[] = [];

        const createIntermediateBuild = (
            weapon: Weapon,
            head: Armour,
            torso: Armour,
            arms: Armour,
            legs: Armour,
        ): IntermediateBuild => ({
            arms: createIntermediateFormat(arms),
            head: createIntermediateFormat(head),
            lantern: createIntermediateFormat(itemData.lantern),
            legs: createIntermediateFormat(legs),
            torso: createIntermediateFormat(torso),
            weapon: createIntermediateFormat(weapon),
        });

        const createBuildIdentifier = (build: IntermediateBuild, cellsSlotted: CellsSlottedMap): string =>
            md5(
                "build::" +
                    Object.keys(sortObjectByKeys(build))
                        .map(key => build[key as keyof IntermediateBuild].name)
                        .join("::") +
                    Object.keys(sortObjectByKeys(cellsSlotted))
                        .map(key => cellsSlotted[key as keyof CellsSlottedMap] ?? "Null")
                        .join("::"),
            );

        const adjustPerk = (perkName: string, adjustment: number) => {
            if (requestedPerksCurrent[perkName] !== undefined) {
                requestedPerksCurrent[perkName] += adjustment * 3;
                adjustCell(perkCellMap[perkName], adjustment);
            }
        };

        const adjustCell = (cellType: CellType, adjustment: number) => {
            requestedSlots[cellType] += adjustment;
        };

        const adjustPerksAndCells = (item: Weapon | Armour, adjustment: number) => {
            if (item.perks) {
                item.perks.forEach(perk => {
                    if (perk.powerSurged) {
                        adjustPerk(perk.name, adjustment);
                    }
                });
            }
            (Array.isArray(item.cells) ? item.cells : [item.cells]).forEach(cell => {
                if (cell) {
                    adjustCell(cell, adjustment);
                }
            });
        };

        const createBuild = (weapon: Weapon, armourSelections: ArmourSelectionData) => {
            const build = createIntermediateBuild(
                weapon,
                armourSelections[ArmourType.Head] as Armour,
                armourSelections[ArmourType.Torso] as Armour,
                armourSelections[ArmourType.Arms] as Armour,
                armourSelections[ArmourType.Legs] as Armour,
            );
            const { fulfillsCriteria, perks, cellsSlotted } = evaluateBuild(build);

            if (!fulfillsCriteria) {
                return;
            }

            const ident = createBuildIdentifier(build, cellsSlotted);
            const doesBuildAlreadyExist = matchingBuilds.find(build => build.ident === ident) !== undefined;
            if (doesBuildAlreadyExist) {
                return;
            }

            matchingBuilds.push({ build, cellsSlotted, ident, perks });
            return;
        };

        const finished = (weapon: Weapon) => {
            let required = 0;
            for (const cell in requestedSlots) {
                if (requestedSlots[cell as CellType] > 0) {
                    required += requestedSlots[cell as CellType];
                }
            }
            (Array.isArray(weapon.cells) ? weapon.cells : [weapon.cells]).forEach(cell => {
                if (cell === CellType.Prismatic) {
                    required -= 1;
                }
            });
            return required <= 0;
        };

        const completeBuilds = (i: number, weapon: Weapon, armourSelections: ArmourSelectionData) => {
            if (i > 3) {
                createBuild(weapon, armourSelections);
                return;
            }
            for (const cell in CellType) {
                if (cell === CellType.Prismatic) {
                    continue;
                }
                if (armourSelections[armourPieces[i]] === null) {
                    for (let j = 0; j < armourDataCells[armourPieces[i]][cell as CellType].length; j++) {
                        if (matchingBuilds.length >= maxBuilds) {
                            return;
                        }
                        if (
                            finderOptions.removeExotics &&
                            armourDataCells[armourPieces[i]][cell as CellType][j].rarity === ItemRarity.Exotic
                        ) {
                            continue;
                        }
                        armourSelections[armourPieces[i]] = armourDataCells[armourPieces[i]][cell as CellType][j];
                        completeBuilds(i + 1, weapon, armourSelections);
                        armourSelections[armourPieces[i]] = null;
                    }
                }
            }
        };

        const armourPieces = [ArmourType.Head, ArmourType.Torso, ArmourType.Arms, ArmourType.Legs];

        const chooseItem = (i: number, weapon: Weapon, armourSelections: ArmourSelectionData) => {
            if (i > 3) {
                createBuild(weapon, armourSelections);
                return;
            }
            if (armourSelections[armourPieces[i]] !== null) {
                chooseItem(i + 1, weapon, armourSelections);
                return;
            }
            if (finished(weapon)) {
                completeBuilds(i, weapon, armourSelections);
                return;
            }
            for (const perk in requestedPerksCurrent) {
                for (const cell in requestedSlots) {
                    if (
                        armourData[armourPieces[i]][perk] &&
                        requestedSlots[perkCellMap[perk]] > 0 &&
                        requestedSlots[cell as CellType] > 0 &&
                        requestedPerksCurrent[perk] > 0
                    ) {
                        const armourPiece = armourData[armourPieces[i]][perk][cell as CellType][0];
                        if (!armourPiece) {
                            continue;
                        }
                        if (matchingBuilds.length >= maxBuilds) {
                            return;
                        }
                        if (finderOptions.removeExotics && armourPiece.rarity === ItemRarity.Exotic) {
                            continue;
                        }
                        adjustPerksAndCells(armourPiece, -1);
                        armourSelections[armourPieces[i]] = armourPiece;
                        chooseItem(i + 1, weapon, armourSelections);
                        adjustPerksAndCells(armourPiece, 1);
                        armourSelections[armourPieces[i]] = null;
                    }
                }
            }
            for (const cell in requestedSlots) {
                if (requestedSlots[cell as CellType] > 0) {
                    const armourPiece = armourDataCells[armourPieces[i]][cell as CellType][0];
                    if (!armourPiece) {
                        continue;
                    }
                    if (matchingBuilds.length >= maxBuilds) {
                        return;
                    }
                    if (finderOptions.removeExotics && armourPiece.rarity === ItemRarity.Exotic) {
                        continue;
                    }
                    adjustPerksAndCells(armourPiece, -1);
                    armourSelections[armourPieces[i]] = armourPiece;
                    chooseItem(i + 1, weapon, armourSelections);
                    adjustPerksAndCells(armourPiece, 1);
                    armourSelections[armourPieces[i]] = null;
                }
            }
        };

        type ArmourSelectionData = {
            [armourType in ArmourType]: Armour | null;
        };

        const armourSelections: ArmourSelectionData = {
            [ArmourType.Head]: null,
            [ArmourType.Torso]: null,
            [ArmourType.Arms]: null,
            [ArmourType.Legs]: null,
        };

        armourPieces.forEach(armourType => {
            const prePickedItem = match<ArmourType, Armour | undefined | null>(armourType)
                .with(ArmourType.Head, () => pickerHead)
                .with(ArmourType.Torso, () => pickerTorso)
                .with(ArmourType.Arms, () => pickerArms)
                .with(ArmourType.Legs, () => pickerLegs)
                .otherwise(() => null);
            if (prePickedItem) {
                armourSelections[armourType] = prePickedItem;
                adjustPerksAndCells(prePickedItem, -1);
            }
        });

        (Array.isArray(itemData.lantern.cells) ? itemData.lantern.cells : [itemData.lantern.cells]).forEach(cell => {
            if (cell) {
                adjustCell(cell, -1);
            }
        });

        for (const weapon of itemData.weapons) {
            if (matchingBuilds.length >= maxBuilds) {
                return matchingBuilds;
            }

            adjustPerksAndCells(weapon, -1);
            chooseItem(0, weapon, armourSelections);
            adjustPerksAndCells(weapon, 1);
        }

        return matchingBuilds;
    };

    return findMatchingBuilds();
};

export const convertFindBuildResultsToBuildModel = (matchingBuilds: MatchingBuild[]) => {
    return matchingBuilds.map(intermediateBuild => {
        const build = new BuildModel();

        let weaponName = intermediateBuild.build.weapon.name;
        let bondWeapon = null;

        if (weaponName.indexOf(bondWrapperSeparator) > -1) {
            const parts = weaponName.split(bondWrapperSeparator);
            weaponName = parts[0];
            bondWeapon = parts[1];
        }

        build.weaponName = weaponName;
        build.weaponSurged = true;
        build.weaponCell1 = findCellVariantByPerk(intermediateBuild.cellsSlotted.weapon[0]);
        build.weaponCell2 = findCellVariantByPerk(intermediateBuild.cellsSlotted.weapon[1]);
        build.bondWeapon = bondWeapon;
        build.headName = intermediateBuild.build.head.name;
        build.headSurged = true;
        build.headCell = findCellVariantByPerk(intermediateBuild.cellsSlotted.head[0]);
        build.torsoName = intermediateBuild.build.torso.name;
        build.torsoSurged = true;
        build.torsoCell = findCellVariantByPerk(intermediateBuild.cellsSlotted.torso[0]);
        build.armsName = intermediateBuild.build.arms.name;
        build.armsSurged = true;
        build.armsCell = findCellVariantByPerk(intermediateBuild.cellsSlotted.arms[0]);
        build.legsName = intermediateBuild.build.legs.name;
        build.legsSurged = true;
        build.legsCell = findCellVariantByPerk(intermediateBuild.cellsSlotted.legs[0]);
        build.lantern = intermediateBuild.build.lantern.name;
        build.lanternCell = findCellVariantByPerk(intermediateBuild.cellsSlotted.lantern[0]);
        return build;
    });
};

const orMode = (a: boolean, b: boolean) => a || b;
