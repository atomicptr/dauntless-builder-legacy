import { Error } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Grid,
    LinearProgress,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import PageTitle from "@src/components/PageTitle";
import { perkData } from "@src/components/PerkList";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { BuildModel } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { Perk } from "@src/data/Perks";
import {
    AssignedPerkValue,
    clearPerks,
    selectBuildFinderSelection,
    setPerkValue,
    setWeaponType,
} from "@src/features/build-finder/build-finder-selection-slice";
import {
    convertFindBuildResultsToBuildModel,
    createItemData,
    FinderItemData,
    FinderItemDataOptions,
    perks,
} from "@src/features/build-finder/find-builds";
import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import log from "@src/utils/logger";
import BuildFinderWorker from "@src/worker/build-finder?worker";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiMinus } from "react-icons/all";
import { LazyLoadComponent } from "react-lazy-load-image-component";

const buildLimit = 200;
const buildDisplayLimit = 50;

// Since the lantern itself does not matter I decided to pre-pick Shrike's Zeal as the Shrike is DB mascot :).
const lanternName = "Shrike's Zeal";

// Currently import statements within web workers seem to only work in Chrome, this is not an issue when
// this gets compiled, therefore we only disable this when DB_DEVMODE is set and we're not using Chrome.
const webworkerDisabled = DB_DEVMODE && navigator.userAgent.search("Chrome") === -1;

const findBuilds = async (
    itemData: FinderItemData,
    requestedPerks: AssignedPerkValue,
    maxBuilds: number,
    options: FinderItemDataOptions = {},
): Promise<BuildModel[]> => {
    const buildFinder = webworkerDisabled ? null : new BuildFinderWorker();

    if (buildFinder === null) {
        log.warn("Web Worker based build finder is currently disabled due to not using Chrome!");
        return Promise.resolve([]);
    }

    return new Promise(resolve => {
        buildFinder.postMessage({ itemData, maxBuilds, options, requestedPerks });

        buildFinder.addEventListener("message", message => {
            const builds = message.data;
            resolve(convertFindBuildResultsToBuildModel(builds));
        });
    });
};

const BuildFinder: React.FC = () => {
    const { t } = useTranslation();
    const { weaponType, selectedPerks, removeExotics, removeLegendary } = useAppSelector(selectBuildFinderSelection);
    const configuration = useAppSelector(selectConfiguration);
    const isMobile = useIsMobile();

    const [builds, setBuilds] = useState<BuildModel[]>([]);
    const [canPerkBeAdded, setCanPerkBeAdded] = useState<{ [perkName: string]: boolean }>({});
    const [searching, setSearching] = useState(false);

    const dispatch = useAppDispatch();

    const finderOptions: FinderItemDataOptions = useMemo(
        () => ({
            removeExotics,
            removeLegendary,
        }),
        [removeExotics, removeLegendary],
    );

    const itemData = useMemo(
        () => createItemData(weaponType, lanternName, selectedPerks, finderOptions),
        [weaponType, selectedPerks, finderOptions],
    );

    useEffect(() => {
        findBuilds(itemData, selectedPerks, buildLimit, finderOptions).then(builds => {
            setBuilds(builds);
        });
    }, [itemData, selectedPerks, finderOptions]);

    useEffect(() => {
        const canBeAdded = async (builds: BuildModel[], perk: Perk): Promise<{ [perkName: string]: boolean }> => {
            if (Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0) >= 36) {
                return Promise.resolve({ [perk.name]: false });
            }

            if (perk.name in selectedPerks && selectedPerks[perk.name] >= 6) {
                return Promise.resolve({ [perk.name]: false });
            }

            if (Object.values(selectedPerks).length <= 3) {
                return Promise.resolve({ [perk.name]: true });
            }

            const perkAvailableInGeneratedBuilds = builds.some(build => {
                const buildPerks = perkData(build);
                const buildPerk = buildPerks.find(p => p.name === perk.name);

                if (!buildPerk) {
                    return false;
                }

                if (buildPerk.name in selectedPerks) {
                    return buildPerk.count === selectedPerks[buildPerk.count] + 3;
                }

                return true;
            });

            if (perkAvailableInGeneratedBuilds) {
                return Promise.resolve({ [perk.name]: true });
            }

            const fitsInOneBuild = builds.some(build => perkFitsInEmptyCellSlot(build, perk));

            if (fitsInOneBuild) {
                return Promise.resolve({ [perk.name]: true });
            }

            // if we can't even find this many builds than there is no point in doing a deep search
            if (builds.length < buildLimit) {
                return Promise.resolve({ [perk.name]: false });
            }

            const requestedPerkValue = perk.name in selectedPerks ? selectedPerks[perk.name] + 3 : 3;
            const requestedPerks = { ...selectedPerks, [perk.name]: requestedPerkValue };

            const results = await findBuilds(itemData, requestedPerks, 1, finderOptions);
            return { [perk.name]: results.length > 0 };
        };

        const runWorkers = async () => {
            log.time("determineAvailablePerks");
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
            log.timeEnd("determineAvailablePerks");
            setSearching(false);
        };

        setSearching(true);
        runWorkers();
    }, [selectedPerks, itemData, builds, finderOptions]);

    const perkFitsInEmptyCellSlot = (build: BuildModel, perk: Perk): boolean => {
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

    const canAddPerk = (perk: Perk): boolean => perk.name in canPerkBeAdded && canPerkBeAdded[perk.name];

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
                {t("feature-disabled-browser")}
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

            {configuration.devMode && (
                <Card>
                    <CardContent>
                        <Stack spacing={1}>
                            <Typography variant="h5">{"Development Options"}</Typography>
                            <Button
                                onClick={() => dispatch(clearPerks())}
                                variant="outlined"
                            >
                                {"Clear All Perks"}
                            </Button>
                            <Box>
                                <Typography>
                                    {`Number of Perks selected: ${Object.keys(selectedPerks).length}`}
                                </Typography>
                                <Typography>{`Number of Builds: ${builds.length}`}</Typography>
                            </Box>
                            <pre>
                                <code>{JSON.stringify(selectedPerks, null, "    ")}</code>
                            </pre>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {weaponType !== null && (
                <>
                    {searching ? <LinearProgress /> : null}

                    <Typography variant="h5">{t("pages.build-finder.perks-title")}</Typography>

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
                                                elevation={!searching && canAddPerk(perk) ? 1 : 0}
                                                sx={{ flexGrow: 2 }}
                                            >
                                                <CardActionArea
                                                    disabled={searching || !canAddPerk(perk)}
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
                                                <Card sx={{ width: "50px" }}>
                                                    <CardActionArea
                                                        disabled={searching}
                                                        onClick={() =>
                                                            dispatch(setPerkValue({ perkName: perk.name, value: Math.max(0, selectedPerks[perk.name] - 3) }))
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
                                                            <BiMinus />
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

                    {Object.keys(selectedPerks).length > 0 && (
                        <>
                            <Typography variant="h5">
                                {t("pages.build-finder.builds-title", { num: Math.min(builds.length, buildDisplayLimit) })}
                            </Typography>
                            {builds.slice(0, buildDisplayLimit).map((build, index) => (
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
                </>
            )}
        </Stack>
    );
};

export default BuildFinder;
