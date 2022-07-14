import { Clear, Error } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Grid,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import PageTitle from "@src/components/PageTitle";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel, findLanternByName } from "@src/data/BuildModel";
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
} from "@src/features/build-finder/build-finder-selection-slice";
import {
    convertFindBuildResultsToBuildModel,
    findArmourPiecesByType,
    FinderItemData,
    perkCellMap,
    perks,
} from "@src/features/build-finder/find-builds";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import log from "@src/utils/logger";
import BuildFinderWorker from "@src/worker/build-finder?worker";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";

const buildLimit = 50;
// Since the lantern itself does not matter I decided to pre-pick Shrike's Zeal as the Shrike is DB mascot :).
const lanternName = "Shrike's Zeal";
// This feature is super slow (but worthwhile having in code RN)
const enableSuperPerksFinder = false;
// Currently import statements within web workers seem to only work in Chrome, this is not an issue when
// this gets compiled, therefore we only disable this when DB_DEVMODE is set and we're not using Chrome.
const webworkerDisabled = DB_DEVMODE && navigator.userAgent.search("Chrome") === -1;

const findBuilds = async (
    itemData: FinderItemData,
    requestedPerks: AssignedPerkValue,
    maxBuilds: number,
): Promise<BuildModel[]> => {
    const buildFinder = webworkerDisabled ? null : new BuildFinderWorker();

    if (buildFinder === null) {
        log.warn("Web Worker based build finder is currently disabled due to not using Chrome!");
        return Promise.resolve([]);
    }

    return new Promise(resolve => {
        buildFinder.postMessage({ itemData, maxBuilds, requestedPerks });

        buildFinder.addEventListener("message", message => {
            const builds = message.data;
            resolve(convertFindBuildResultsToBuildModel(builds));
        });
    });
};

const BuildFinder: React.FC = () => {
    const { t } = useTranslation();
    const { weaponType, selectedPerks } = useAppSelector(selectBuildFinderSelection);
    const isMobile = useIsMobile();

    const [builds, setBuilds] = useState<BuildModel[]>([]);
    const [canPerkBeAdded, setCanPerkBeAdded] = useState<{ [perkName: string]: boolean }>({});
    const [searching, setSearching] = useState(false);

    const dispatch = useAppDispatch();

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

    useEffect(() => {
        findBuilds(itemData, selectedPerks, buildLimit).then(builds => {
            setBuilds(builds);
        });
    }, [itemData, selectedPerks]);

    useEffect(() => {
        const canBeAdded = async (builds: BuildModel[], perk: Perk): Promise<{ [perkName: string]: boolean }> => {
            if (Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0) + 3 > 36) {
                return Promise.resolve({ [perk.name]: false });
            }

            if (perk.name in selectedPerks && selectedPerks[perk.name] >= 6) {
                return Promise.resolve({ [perk.name]: false });
            }

            /*
            TODO: this doesn't work properly
            const fitsInOneBuild = builds.some(build => _perkFitsInEmptyCellSlot(build, perk));

            if (!fitsInOneBuild) {
                return Promise.resolve({[perk.name]: false});
            }
            */

            if (!enableSuperPerksFinder) {
                return Promise.resolve({ [perk.name]: true });
            }

            const requestedPerkValue = perk.name in selectedPerks ? selectedPerks[perk.name] + 3 : 3;
            const requestedPerks = { ...selectedPerks, [perk.name]: requestedPerkValue };

            const results = await findBuilds(itemData, requestedPerks, 1);
            return { [perk.name]: results.length > 0 };
        };

        const runWorker = async () => {
            console.time("canBeAdded");
            const result = await Promise.all(
                Object.values(perks)
                    .flat()
                    .map(perk => canBeAdded(builds, perk)),
            );

            let newCanBeAddedMap = {};

            result.forEach(resultMap => {
                newCanBeAddedMap = { ...newCanBeAddedMap, ...resultMap };
            });

            setCanPerkBeAdded(newCanBeAddedMap);
            console.timeEnd("canBeAdded");
            setSearching(false);
        };

        setSearching(true);
        runWorker();
    }, [selectedPerks]);

    console.log(builds, selectedPerks, canPerkBeAdded);

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

    const canAddPerk = (perk: Perk): boolean => !searching && perk.name in canPerkBeAdded && canPerkBeAdded[perk.name];

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

    if (webworkerDisabled) {
        return (
            <Alert
                color="error"
                icon={<Error />}
            >
                This feature is currently disabled for this web browser.
            </Alert>
        );
    }

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
                                        <Stack
                                            key={perk.name}
                                            direction="row"
                                            spacing={1}
                                        >
                                            <Card
                                                elevation={canAddPerk(perk) ? 1 : 0}
                                                sx={{ flexGrow: 2 }}
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
                                            </Card>

                                            {perk.name in selectedPerks && (
                                                <Card sx={{ flexGrow: 1 }}>
                                                    <CardActionArea
                                                        onClick={() =>
                                                            dispatch(setPerkValue({ perkName: perk.name, value: 0 }))
                                                        }
                                                        sx={{
                                                            alignItems: "center",
                                                            display: "flex",
                                                            height: "100%",
                                                            justifyContent: "center",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <Box>
                                                            <Clear />
                                                        </Box>
                                                    </CardActionArea>
                                                </Card>
                                            )}
                                        </Stack>
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
