import { Error } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Grid,
    LinearProgress,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import InputDialog from "@src/components/InputDialog";
import PageTitle from "@src/components/PageTitle";
import { perkData } from "@src/components/PerkList";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { BuildModel } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import { WeaponType } from "@src/data/Weapon";
import {
    AssignedPerkValue,
    clearPerks,
    selectBuildFinderSelection,
    setBuildFinderWeaponType,
    setPerkValue,
    setRemoveExotics,
    setRemoveLegendary,
} from "@src/features/build-finder/build-finder-selection-slice";
import {
    convertFindBuildResultsToBuildModel,
    FinderItemDataOptions,
    perks,
} from "@src/features/build-finder/find-builds";
import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import useIsMobile from "@src/hooks/is-mobile";
import useIsLightMode from "@src/hooks/light-mode";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import log from "@src/utils/logger";
import BuildFinderWorker from "@src/worker/build-finder?worker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiMinus } from "react-icons/all";
import { LazyLoadComponent } from "react-lazy-load-image-component";

const buildLimit = 200;
const buildDisplayLimit = 50;

// Currently import statements within web workers seem to only work in Chrome, this is not an issue when
// this gets compiled, therefore we only disable this when DB_DEVMODE is set and we're not using Chrome.
// Firefox related issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
const webworkerDisabled = DB_DEVMODE && navigator.userAgent.search("Chrome") === -1;

const findBuilds = async (
    weaponType: WeaponType | null,
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
        buildFinder.postMessage({ maxBuilds, options, requestedPerks, weaponType });

        buildFinder.addEventListener("message", message => {
            const builds = message.data;
            resolve(convertFindBuildResultsToBuildModel(builds));
        });
    });
};

const BuildFinder: React.FC = () => {
    const isLightMode = useIsLightMode();

    const { t } = useTranslation();
    const { weaponType, selectedPerks, removeExotics, removeLegendary } = useAppSelector(selectBuildFinderSelection);
    const configuration = useAppSelector(selectConfiguration);
    const isMobile = useIsMobile();

    const [builds, setBuilds] = useState<BuildModel[]>([]);
    const [canPerkBeAdded, setCanPerkBeAdded] = useState<{ [perkName: string]: boolean }>({});
    const [isSearchingBuilds, setIsSearchingBuilds] = useState(false);
    const [isDeterminingSelectablePerks, setIsDeterminingSelectablePerks] = useState(false);
    const [inputDialogOpen, setInputDialogOpen] = useState(false);

    const dispatch = useAppDispatch();

    const finderOptions: FinderItemDataOptions = useMemo(
        () => ({
            removeExotics,
            removeLegendary,
        }),
        [removeExotics, removeLegendary],
    );

    useEffect(() => {
        log.timer("findBuilds");
        setIsSearchingBuilds(true);
        findBuilds(weaponType, selectedPerks, buildLimit, finderOptions).then(builds => {
            setBuilds(builds);
            setIsSearchingBuilds(false);
            log.timerEnd("findBuilds");
            log.debug(`Found ${builds.length} builds for given criteria`, { selectedPerks });
        });
    }, [weaponType, selectedPerks, finderOptions]);

    useEffect(() => {
        const canBeAdded = async (builds: BuildModel[], perk: Perk): Promise<{ [perkName: string]: boolean }> => {
            const totalPerkValue = Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0);

            if (totalPerkValue >= 36) {
                return { [perk.name]: false };
            }

            if (perk.name in selectedPerks && selectedPerks[perk.name] >= 6) {
                return { [perk.name]: false };
            }

            if (Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0) <= 18) {
                return { [perk.name]: true };
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
                return { [perk.name]: true };
            }

            const fitsInOneBuild = builds.some(build => perkFitsInEmptyCellSlot(build, perk));

            if (fitsInOneBuild) {
                return { [perk.name]: true };
            }

            log.debug(`Have to do deep search for ${perk.name}`, { selectedPerks });

            const requestedPerkValue = perk.name in selectedPerks ? selectedPerks[perk.name] + 3 : 3;
            const requestedPerks = { ...selectedPerks, [perk.name]: requestedPerkValue };

            const results = await findBuilds(weaponType, requestedPerks, 1, finderOptions);
            return { [perk.name]: results.length > 0 };
        };

        const runWorkers = async () => {
            log.timer("determineAvailablePerks");
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
            log.timerEnd("determineAvailablePerks");
            setIsDeterminingSelectablePerks(false);
        };

        setIsDeterminingSelectablePerks(true);
        runWorkers();
    }, [selectedPerks, weaponType, builds, finderOptions]);

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

            if (cell === CellType.Prismatic) {
                return true;
            }

            if (perk.type === cell) {
                return true;
            }
        }

        return false;
    };

    const canAddPerk = useCallback(
        (perk: Perk): boolean =>
            !isDeterminingSelectablePerks &&
            !isSearchingBuilds &&
            perk.name in canPerkBeAdded &&
            canPerkBeAdded[perk.name],
        [isDeterminingSelectablePerks, isSearchingBuilds, canPerkBeAdded],
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
        <Stack
            spacing={2}
            sx={{ pb: 4 }}
        >
            <PageTitle title={t("pages.build-finder.title")} />

            <WeaponTypeSelector
                onChange={weaponType => dispatch(setBuildFinderWeaponType(weaponType))}
                value={weaponType}
            />
            <Typography variant="h5">{t("pages.build-finder.filter-title")}</Typography>

            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={removeExotics}
                            onChange={e => dispatch(setRemoveExotics(e.target.checked))}
                        />
                    }
                    label={t("pages.build-finder.remove-exotics")}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={removeLegendary}
                            onChange={e => dispatch(setRemoveLegendary(e.target.checked))}
                        />
                    }
                    label={t("pages.build-finder.remove-legendary")}
                />
            </FormGroup>

            {configuration.devMode && (
                <>
                    <Card>
                        <CardContent>
                            <Stack spacing={1}>
                                <Typography variant="h5">{t("pages.build-finder.dev-options-title")}</Typography>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                >
                                    <Button
                                        onClick={() => dispatch(clearPerks())}
                                        variant="outlined"
                                    >
                                        {t("pages.build-finder.dev-clear-perks")}
                                    </Button>
                                    <Button
                                        onClick={() => setInputDialogOpen(true)}
                                        variant="outlined"
                                    >
                                        {t("pages.build-finder.dev-set-perks")}
                                    </Button>
                                </Stack>
                                <Box>
                                    <Typography>
                                        {t("pages.build-finder.dev-number-of-perks", {
                                            num: Object.keys(selectedPerks).length,
                                        })}
                                    </Typography>
                                    <Typography>
                                        {t("pages.build-finder.dev-number-of-builds", { num: builds.length })}
                                    </Typography>
                                </Box>
                                <pre>
                                    <code>{JSON.stringify(selectedPerks, null, "    ")}</code>
                                </pre>
                            </Stack>
                        </CardContent>
                    </Card>
                    <InputDialog
                        multiline
                        onClose={() => setInputDialogOpen(false)}
                        onConfirm={input => {
                            dispatch(clearPerks());
                            try {
                                const json = JSON.parse(input) as AssignedPerkValue;
                                for (const [perkName, value] of Object.entries(json)) {
                                    dispatch(setPerkValue({ perkName, value }));
                                }
                            } catch (e) {
                                log.error("Could not set perk values", { e });
                            }
                            setInputDialogOpen(false);
                        }}
                        open={inputDialogOpen}
                        title={t("pages.build-finder.dev-set-perks")}
                    />
                </>
            )}

            {weaponType !== null && (
                <>
                    <Typography variant="h5">{t("pages.build-finder.perks-title")}</Typography>

                    {isDeterminingSelectablePerks ? <LinearProgress /> : null}

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
                                            style={{
                                                filter: isLightMode ? "invert(100%)" : undefined,
                                                height: "64px",
                                                width: "64px",
                                            }}
                                        />
                                        <Typography>{t(`terms.cell-type.${cellType}`)}</Typography>
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
                                                        {t(itemTranslationIdentifier(ItemType.Perk, perk.name, "name"))}
                                                        {" "}
                                                        {renderPerkLevel(perk)}
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>

                                            {perk.name in selectedPerks && (
                                                <Card sx={{ width: "50px" }}>
                                                    <CardActionArea
                                                        disabled={isDeterminingSelectablePerks}
                                                        onClick={() =>
                                                            dispatch(
                                                                setPerkValue({
                                                                    perkName: perk.name,
                                                                    value: Math.max(0, selectedPerks[perk.name] - 3),
                                                                }),
                                                            )
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

                    {(isDeterminingSelectablePerks || isSearchingBuilds) && (
                        <Box
                            display="flex"
                            justifyContent="center"
                        >
                            <CircularProgress />
                        </Box>
                    )}

                    {!isDeterminingSelectablePerks && !isSearchingBuilds && Object.keys(selectedPerks).length > 0 && (
                        <>
                            <Typography variant="h5">
                                {t("pages.build-finder.builds-title", {
                                    num: Math.min(builds.length, buildDisplayLimit),
                                })}
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
