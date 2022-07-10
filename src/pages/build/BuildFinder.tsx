import {Box, Button, Card, CardActionArea, CardContent, Grid, Skeleton, Stack, Typography} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import PageTitle from "@src/components/PageTitle";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import {Armour, ArmourType} from "@src/data/Armour";
import {BuildModel, findCellVariantByPerk, findLanternByName} from "@src/data/BuildModel";
import {CellType} from "@src/data/Cell";
import dauntlessBuilderData from "@src/data/Data";
import {Lantern} from "@src/data/Lantern";
import {Perk} from "@src/data/Perks";
import {Weapon} from "@src/data/Weapon";
import {
    AssignedPerkValue,
    clearPerks,
    selectBuildFinderSelection,
    setPerkValue,
    setWeaponType,
} from "@src/features/build-finder-selection/build-finder-selection-slice";
import useIsMobile from "@src/hooks/is-mobile";
import {useAppDispatch, useAppSelector} from "@src/hooks/redux";
import React, {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {LazyLoadComponent} from "react-lazy-load-image-component";
import {ItemRarity} from "@src/data/ItemRarity";

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

const buildLimit = 200;

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
            Object.values(dauntlessBuilderData.armours)
                .filter(armourPiece => armourPiece.type === type)
                .filter(armourPiece => armourPiece.rarity !== ItemRarity.Exotic) // remove exotics for now...
                .filter(filterPerksAndCells(Object.keys(selectedPerks).length <= 3 ? orMode : andMode));

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
    }, [weaponType, selectedPerks, perkCellMap]);

    const builds = useMemo(() => {
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

            for (const perkName in selectedPerks) {
                const desiredValue = selectedPerks[perkName];

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
                for (const perk in selectedPerks) {
                    const desiredValue = selectedPerks[perk];

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
                build: IntermediateBuild;
                perks: AssignedPerkValue;
                cellsSlotted: CellsSlottedMap;
            }[] = [];

            for (const weapon of itemData.weapons) {
                for (const head of itemData.head) {
                    for (const torso of itemData.torso) {
                        for (const arms of itemData.arms) {
                            for (const legs of itemData.legs) {
                                if (matchingBuilds.length >= buildLimit) {
                                    return matchingBuilds;
                                }

                                const build = {
                                    arms: createIntermediateFormat(arms),
                                    head: createIntermediateFormat(head),
                                    lantern: createIntermediateFormat(itemData.lantern),
                                    legs: createIntermediateFormat(legs),
                                    torso: createIntermediateFormat(torso),
                                    weapon: createIntermediateFormat(weapon),
                                };

                                const { fulfillsCriteria, perks, cellsSlotted } = evaluateBuild(build);

                                if (!fulfillsCriteria) {
                                    continue;
                                }

                                matchingBuilds.push({ build, cellsSlotted, perks });
                            }
                        }
                    }
                }
            }

            return matchingBuilds;
        };

        console.time("build builds");
        const matchingBuilds = findMatchingBuilds();

        const builds = matchingBuilds.map(intermediateBuild => {
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

        console.timeEnd("build builds");

        return builds;
    }, [itemData, selectedPerks, perkCellMap]);

    console.log(builds, selectedPerks);

    const isPerkDisabled = (perk: Perk): boolean => {
        return perk.name in selectedPerks && selectedPerks[perk.name] >= 6;
    };

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
                                            elevation={isPerkDisabled(perk) ? 0 : 1}
                                        >
                                            <CardActionArea
                                                disabled={isPerkDisabled(perk)}
                                                onClick={() => onPerkClicked(perk)}
                                            >
                                                <CardContent>
                                                    {perk.name} 
                                                    {" "}
                                                    {renderPerkLevel(perk)}
                                                </CardContent>
                                            </CardActionArea>
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
