import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel, findCellVariantByPerk, findLanternByName } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import { ItemRarity } from "@src/data/ItemRarity";
import { Lantern } from "@src/data/Lantern";
import { Perk, PerkValue } from "@src/data/Perks";
import { Weapon, WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/reducers/build-finder/build-finder-selection-slice";
import createPermutation from "@src/utils/create-permutation";
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
    head: Armour[];
    torso: Armour[];
    arms: Armour[];
    legs: Armour[];
    lantern: Lantern;
}

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

    const { pickerWeapon, pickerHead, pickerTorso, pickerArms, pickerLegs } = finderOptions;

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

    const findMatchingArmourPiecesByType = (type: ArmourType) =>
        findArmourPiecesByType(type).filter(
            filterPerksAndCells(Object.keys(requestedPerks).length <= 3 ? orMode : andMode),
        );

    const findMatchingArmourPiecesAndEnsureAllCellSlotsAreCovered = (type: ArmourType): Armour[] => {
        const prepickedItem = match<ArmourType, Armour | undefined | null>(type)
            .with(ArmourType.Head, () => pickerHead)
            .with(ArmourType.Torso, () => pickerTorso)
            .with(ArmourType.Arms, () => pickerArms)
            .with(ArmourType.Legs, () => pickerLegs)
            .otherwise(() => null);

        if (prepickedItem) {
            return [prepickedItem];
        }

        let matching = findMatchingArmourPiecesByType(type);
        for (const perk in requestedPerks) {
            const hasMatchingCellSlot =
                Object.values(matching)
                    .map(armourPiece => (Array.isArray(armourPiece.cells) ? armourPiece.cells : [armourPiece.cells]))
                    .filter(cells => cells.indexOf(perkCellMap[perk]) > -1).length > 0;
            if (!hasMatchingCellSlot) {
                matching = matching.concat(findArmourPieceByCell(type, perk, options));
            }
        }
        return matching;
    };

    const findArmourPieceByCell = (type: ArmourType, perkName: string, options: FinderItemDataOptions = {}) => {
        const hasMatchingCellSlot = (cells: CellType | CellType[] | null, slot: CellType) =>
            (Array.isArray(cells) ? cells : [cells]).indexOf(slot) > -1;
        return findArmourPiecesByType(type, options).filter(armourPiece =>
            hasMatchingCellSlot(armourPiece.cells, perkCellMap[perkName]),
        )[0];
    };

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
        arms: findMatchingArmourPiecesAndEnsureAllCellSlotsAreCovered(ArmourType.Arms),
        head: findMatchingArmourPiecesAndEnsureAllCellSlotsAreCovered(ArmourType.Head),
        lantern: findLanternByName(lanternName) as Lantern,
        legs: findMatchingArmourPiecesAndEnsureAllCellSlotsAreCovered(ArmourType.Legs),
        torso: findMatchingArmourPiecesAndEnsureAllCellSlotsAreCovered(ArmourType.Torso),
        weapons: pickerWeapon
            ? matchingWeapons.filter(weapon => weapon.name.startsWith(pickerWeapon.name))
            : matchingWeapons.filter(filterPerksAndCells()),
    };
};

const cellToArmourArray = () => {
    return {
        [CellType.Prismatic]: [] as Armour[],
        [CellType.Alacrity]: [] as Armour[],
        [CellType.Brutality]: [] as Armour[],
        [CellType.Finesse]: [] as Armour[],
        [CellType.Fortitude]: [] as Armour[],
        [CellType.Insight]: [] as Armour[],
    }
}

type ArmourDataCells = {
    [armourType in ArmourType]: {
        [cellType in CellType]: Armour[];
    }
}

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
            }
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
                    addArmour(armourType, cell, armour)
                }
            })
        }
    }

    addArmours(ArmourType.Head);
    addArmours(ArmourType.Torso);
    addArmours(ArmourType.Arms);
    addArmours(ArmourType.Legs);
    return armourDataCells as unknown as ArmourDataCells; //heads[ArmourType.Head]["Aetheric Attunement"][CellType.Insight]
}

type ArmourData = {
    [armourType in ArmourType]: {
        [perkName: string]: {
            [cellType in CellType]: Armour[];
        }
    }
}

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
            }
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
                    addArmour(armourType, armour.perks[0].name, cell, armour)
                }
            })
        }
    }

    addArmours(ArmourType.Head);
    addArmours(ArmourType.Torso);
    addArmours(ArmourType.Arms);
    addArmours(ArmourType.Legs);
    return armourData as unknown as ArmourData; //heads[ArmourType.Head]["Aetheric Attunement"][CellType.Insight]
}

export const findBuilds = (
    weaponType: WeaponType | null,
    requestedPerks: AssignedPerkValue,
    maxBuilds: number,
    options: FinderItemDataOptions = {},
) => {
    const itemData = createItemData(weaponType, lanternName, requestedPerks, options);

    interface AssignedSlotValue {
        [slotName: string]: number;
    }
    const requestedSlots: AssignedSlotValue = {};

    for (const perkName in requestedPerks) {
        const desiredValue = requestedPerks[perkName];
        if (requestedSlots[perkCellMap[perkName]]) {
            requestedSlots[perkCellMap[perkName]] += desiredValue / 3;
        } else {
            requestedSlots[perkCellMap[perkName]] = desiredValue / 3;
        }
    }

    const currentRequestedSlots = Object.assign({}, requestedSlots);
    const currentRequestedPerks = Object.assign({}, requestedPerks);

    const armourData = generateArmourData();
    const armourDataCells = generateArmourDataCells();

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

        interface IntToArmourType {
            [val: number]: ArmourType
        }

        const intToArmourType: IntToArmourType = { 0: ArmourType.Head, 1: ArmourType.Torso, 2: ArmourType.Arms, 3: ArmourType.Legs };

        const chooseItem = (i: number, perks: AssignedPerkValue, cells: AssignedSlotValue, weapon: Weapon, selections: SelectionData) => {
            //armourData[intToArmourType[i]]
            if (i < 4) {
                //chooseItem(i++, perks, cells, weapon, selections);
            } else {

            }
        }

        type SelectionData = {
            [armourType in ArmourType]: Armour | null
        }

        for (const weapon of itemData.weapons) {
            const selections: SelectionData = {
                [ArmourType.Head]: null,
                [ArmourType.Torso]: null,
                [ArmourType.Arms]: null,
                [ArmourType.Legs]: null,
            }
            // Make dynamic for all perks and cells
            // Put into sub method for adjustments
            if (weapon.perks && currentRequestedPerks[weapon.perks[0].name]) {
                currentRequestedPerks[weapon.perks[0].name] -= 3;
            }
            if (weapon.cells) {
                if (currentRequestedSlots[weapon.cells[0]]) {
                    currentRequestedSlots[weapon.cells[0]] -= 1;
                }
                if (currentRequestedSlots[weapon.cells[1]]) {
                    currentRequestedSlots[weapon.cells[1]] -= 1;
                }
            }
            chooseItem(0, currentRequestedPerks, currentRequestedSlots, weapon, selections);
            if (weapon.perks && currentRequestedPerks[weapon.perks[0].name]) {
                currentRequestedPerks[weapon.perks[0].name] += 3;
            }
            if (weapon.cells) {
                if (currentRequestedSlots[weapon.cells[0]]) {
                    currentRequestedSlots[weapon.cells[0]] += 1;
                }
                if (currentRequestedSlots[weapon.cells[1]]) {
                    currentRequestedSlots[weapon.cells[1]] += 1;
                }
            }
            // for (const [head, torso, arms, legs] of createPermutation([
            //     itemData.head,
            //     itemData.torso,
            //     itemData.arms,
            //     itemData.legs,
            // ])) {
            //     if (matchingBuilds.length >= maxBuilds) {
            //         return matchingBuilds;
            //     }

            //     const build = createIntermediateBuild(weapon, head, torso, arms, legs);

            //     const { fulfillsCriteria, perks, cellsSlotted } = evaluateBuild(build);

            //     if (!fulfillsCriteria) {
            //         continue;
            //     }

            //     const ident = createBuildIdentifier(build, cellsSlotted);
            //     const doesBuildAlreadyExist = matchingBuilds.find(build => build.ident === ident) !== undefined;
            //     if (doesBuildAlreadyExist) {
            //         continue;
            //     }

            //     matchingBuilds.push({ build, cellsSlotted, ident, perks });
            // }
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
const andMode = (a: boolean, b: boolean) => a && b;
