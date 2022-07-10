import { Clear } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import PageTitle from "@src/components/PageTitle";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel, findCellVariantByPerk, findLanternByName } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import { ItemRarity } from "@src/data/ItemRarity";
import { Lantern } from "@src/data/Lantern";
import { Perk } from "@src/data/Perks";
import { Weapon } from "@src/data/Weapon";
import {
    AssignedPerkValue,
    clearPerks,
    selectBuildFinderSelection,
    setPerkValue,
    setWeaponType,
} from "@src/features/build-finder-selection/build-finder-selection-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import createPermutation from "@src/utils/create-permutation";
import sortObjectByKeys from "@src/utils/sort-object-by-keys";
import md5 from "md5";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";

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

const buildLimit = 50;

const lanternName = "Shrike's Zeal";

const BuildFinder: React.FC = () => {
    const { t } = useTranslation();
    const { weaponType, selectedPerks } = useAppSelector(selectBuildFinderSelection);
    const isMobile = useIsMobile();

    const dispatch = useAppDispatch();

    const perks = useMemo(() => {
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
    }, []);

    const perkCellMap = useMemo(() => {
        const cellTypeByPerk: {
            [perkName: string]: CellType;
        } = {};

        Object.values(dauntlessBuilderData.perks).map(perk => {
            cellTypeByPerk[perk.name as keyof typeof cellTypeByPerk] = perk.type;
        });

        return cellTypeByPerk;
    }, []);

    const findArmourPiecesByType = useCallback(
        (type: ArmourType) =>
            Object.values(dauntlessBuilderData.armours)
                .filter(armourPiece => armourPiece.type === type)
                .filter(armourPiece => armourPiece.rarity !== ItemRarity.Exotic), // remove exotics for now...
        [],
    );

    const itemData = useMemo(() => {
        const filterPerksAndCells =
            (mode: (a: boolean, b: boolean) => boolean = orMode) =>
                (item: Weapon | Armour) =>
                    mode(
                    (item.perks && item.perks[0].name in selectedPerks) as boolean,
                    ((item.cells &&
                        (Array.isArray(item.cells) ? item.cells : [item.cells]).some(
                            cellSlot => Object.values(perkCellMap).indexOf(cellSlot) > -1,
                        )) ||
                        (item.cells && item.cells.indexOf(CellType.Prismatic) > -1)) as boolean,
                    );

        const findMatchingArmourPiecesByType = (type: ArmourType) =>
            findArmourPiecesByType(type).filter(
                filterPerksAndCells(Object.keys(selectedPerks).length <= 3 ? orMode : andMode),
            );

        return {
            arms: findMatchingArmourPiecesByType(ArmourType.Arms),
            head: findMatchingArmourPiecesByType(ArmourType.Head),
            lantern: findLanternByName(lanternName) as Lantern,
            legs: findMatchingArmourPiecesByType(ArmourType.Legs),
            torso: findMatchingArmourPiecesByType(ArmourType.Torso),
            weapons: Object.values(dauntlessBuilderData.weapons)
                .filter(weapon => weapon.type === weaponType)
                .filter(weapon => weapon.bond === undefined) // remove legendaries for now...
                .filter(weapon => weapon.rarity !== ItemRarity.Exotic) // remove exotics for now...
                .filter(filterPerksAndCells()),
        };
    }, [weaponType, selectedPerks, perkCellMap, findArmourPiecesByType]);

    const findBuilds = useCallback(
        (requestedPerks: AssignedPerkValue, maxBuilds: number) => {
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

                    for (const itemType in build) {
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
                const matchingBuilds: {
                    ident: string;
                    build: IntermediateBuild;
                    perks: AssignedPerkValue;
                    cellsSlotted: CellsSlottedMap;
                }[] = [];

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

                for (let i = 0; i < 5; i++) {
                    for (const weapon of itemData.weapons) {
                        // first permutation will just be limited data set, which is super fast
                        // if that doesn't work we'll try to expand the pool even further by first adding
                        // all heads, with limited rest, then all torso with limited rest etc.
                        for (const [head, torso, arms, legs] of createPermutation([
                            i === 1 ? findArmourPiecesByType(ArmourType.Head) : itemData.head,
                            i === 2 ? findArmourPiecesByType(ArmourType.Torso) : itemData.torso,
                            i === 3 ? findArmourPiecesByType(ArmourType.Arms) : itemData.arms,
                            i === 4 ? findArmourPiecesByType(ArmourType.Legs) : itemData.legs,
                        ])) {
                            if (matchingBuilds.length >= maxBuilds) {
                                return matchingBuilds;
                            }

                            const build = createIntermediateBuild(weapon, head, torso, arms, legs);

                            const { fulfillsCriteria, perks, cellsSlotted } = evaluateBuild(build);

                            if (!fulfillsCriteria) {
                                continue;
                            }

                            const ident = createBuildIdentifier(build, cellsSlotted);
                            const doesBuildAlreadyExist =
                                matchingBuilds.find(build => build.ident === ident) !== undefined;
                            if (doesBuildAlreadyExist) {
                                continue;
                            }

                            matchingBuilds.push({ build, cellsSlotted, ident, perks });
                        }
                    }
                }

                return matchingBuilds;
            };

            const matchingBuilds = findMatchingBuilds();

            return matchingBuilds.map(intermediateBuild => {
                const build = new BuildModel();
                build.weaponName = intermediateBuild.build.weapon.name;
                build.weaponSurged = true;
                build.weaponCell1 = findCellVariantByPerk(intermediateBuild.cellsSlotted.weapon[0]);
                build.weaponCell2 = findCellVariantByPerk(intermediateBuild.cellsSlotted.weapon[1]);
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
        },
        [itemData, perkCellMap, findArmourPiecesByType],
    );

    const builds = useMemo(() => findBuilds(selectedPerks, buildLimit), [findBuilds, selectedPerks]);

    console.log(builds, selectedPerks);

    const _perkFitsInEmptyCellSlot = (build: BuildModel, perk: Perk): boolean => {
        const makeCellArray = (cells: CellType | CellType[] | null | undefined): CellType[] => {
            if (cells === null || cells === undefined) {
                return [];
            }

            if (!Array.isArray(cells)) {
                return [cells];
            }

            return cells;
        };

        const cells = [
            [build.weaponCell1, makeCellArray(build.data.weapon?.cells)[0]],
            [build.weaponCell2, makeCellArray(build.data.weapon?.cells)[1]],
            [build.headCell, makeCellArray(build.data.head?.cells)[0]],
            [build.torsoCell, makeCellArray(build.data.torso?.cells)[0]],
            [build.armsCell, makeCellArray(build.data.arms?.cells)[0]],
            [build.legsCell, makeCellArray(build.data.legs?.cells)[0]],
            [build.lanternCell, makeCellArray(build.data.lantern?.cells)[0]],
        ];

        for (const [equipped, cell] of cells) {
            if (equipped !== null) {
                continue;
            }

            if (perk.type === cell) {
                return true;
            }
        }

        return false;
    };

    const _testIfPerkCanBeAdded = useCallback(
        (perk: Perk): boolean => {
            if (builds.some(build => _perkFitsInEmptyCellSlot(build, perk))) {
                return true;
            }

            // if it can't find even buildLimit builds, there is no point in searching
            if (builds.length < buildLimit) {
                return false;
            }

            return false;

            // TODO: add webworkers?
            const perkValue = perk.name in selectedPerks ? selectedPerks[perk.name] : 0;

            const requestedPerks = { ...selectedPerks, [perk.name]: perkValue + 3 };

            console.log("I want: ", perk.name, perkValue + 3, requestedPerks);

            return findBuilds(requestedPerks, 1).length > 0;
        },
        [selectedPerks, builds, findBuilds],
    );

    const canAddPerk = useCallback(
        (perk: Perk): boolean =>
            Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0) + 3 <= 36 &&
            (perk.name in selectedPerks ? selectedPerks[perk.name] < 6 : true), // TODO: readd the functions above
        [selectedPerks],
    );

    const onPerkClicked = (perk: Perk) => {
        const value = perk.name in selectedPerks ? selectedPerks[perk.name] + 3 : 3;
        dispatch(setPerkValue({ perkName: perk.name, value }));
    };

    const renderPerkLevel = (perk: Perk) => {
        if (!(perk.name in selectedPerks)) {
            return null;
        }
        return `+${selectedPerks[perk.name]}`;
    };

    return (
        <Stack spacing={2}>
            <PageTitle title={t("pages.build-finder.title")} />

            <WeaponTypeSelector
                onChange={weaponType => dispatch(setWeaponType(weaponType))}
                value={weaponType}
            />

            {/* TODO: remove this, this block is for debug purposes */}
            <Box>
                <Button
                    onClick={() => dispatch(clearPerks())}
                    variant="outlined"
                >
                    Clear Perks
                </Button>
                <Typography>{`Number of Perks selected: ${Object.keys(selectedPerks).length}`}</Typography>
                <Typography>{`Number of Builds: ${builds.length}`}</Typography>
                <pre>
                    <code>{JSON.stringify(selectedPerks, null, "    ")}</code>
                </pre>
            </Box>

            {weaponType !== null && (
                <>
                    <Grid
                        container
                        gap={1}
                    >
                        {Object.keys(perks).map(cellType => (
                            <Grid
                                key={cellType}
                                item
                                sx={{ flexGrow: 1 }}
                                xs={isMobile ? 12 : undefined}
                            >
                                <Stack spacing={1}>
                                    <Stack
                                        spacing={1}
                                        sx={{ alignItems: "center", my: 2 }}
                                    >
                                        <img
                                            src={`/assets/icons/perks/${cellType}.png`}
                                            style={{ height: "64px", width: "64px" }}
                                        />
                                        <Typography>{cellType}</Typography>
                                    </Stack>

                                    {perks[cellType as keyof typeof perks].map((perk: Perk) => (
                                        <Card
                                            key={perk.name}
                                            elevation={canAddPerk(perk) ? 1 : 0}
                                        >
                                            <CardActionArea
                                                disabled={!canAddPerk(perk)}
                                                onClick={() => onPerkClicked(perk)}
                                            >
                                                <CardContent>
                                                    {perk.name} 
                                                    {" "}
                                                    {renderPerkLevel(perk)}
                                                </CardContent>
                                            </CardActionArea>
                                            {perk.name in selectedPerks && (
                                                <CardActions>
                                                    <IconButton>
                                                        <Clear
                                                            onClick={() =>
                                                                dispatch(
                                                                    setPerkValue({ perkName: perk.name, value: 0 }),
                                                                )
                                                            }
                                                        />
                                                    </IconButton>
                                                </CardActions>
                                            )}
                                        </Card>
                                    ))}
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>

                    {Object.keys(selectedPerks).length > 0 &&
                        builds.map((build, index) => (
                            <Box key={index}>
                                <LazyLoadComponent
                                    placeholder={
                                        <Skeleton
                                            height={300}
                                            variant={"rectangular"}
                                            width="100%"
                                        />
                                    }
                                >
                                    <Box>
                                        <BuildCard build={build} />
                                    </Box>
                                </LazyLoadComponent>
                            </Box>
                        ))}
                </>
            )}
        </Stack>
    );
};

const orMode = (a: boolean, b: boolean) => a || b;
const andMode = (a: boolean, b: boolean) => a && b;

export default BuildFinder;
