import { Clear } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import FinderPerkPicker from "@src/components/FinderPerkPicker";
import InputDialog from "@src/components/InputDialog";
import ItemSelectDialog, {
    filterByArmourType,
    filterByWeaponType,
    FilterFunc,
    filterRemoveExotics,
    filterRemoveLegendaries,
} from "@src/components/ItemSelectDialog";
import MiniItemPicker from "@src/components/MiniItemPicker";
import PageTitle from "@src/components/PageTitle";
import { perkData } from "@src/components/PerkList";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import { findByKebabCaseName, Weapon, WeaponType } from "@src/data/Weapon";
import { cacheAsync } from "@src/hooks/cache";
import useIsMobile from "@src/hooks/is-mobile";
import {
    convertFindBuildResultsToBuildModel,
    FinderItemDataOptions,
    MatchingBuild,
    perks,
} from "@src/pages/build/find-builds";
import { configurationAtom, setFinderPerkMatching } from "@src/state/configuration";
import {
    applyFinderConfigString,
    AssignedPerkValue,
    clearPerks,
    finderAtom,
    finderConfigView,
    setBuildFinderWeaponType,
    setPerkValue,
    setPicker,
    setRemoveExotics,
    setRemoveLegendary,
} from "@src/state/finder";
import log from "@src/utils/logger";
import AvailablePerksChecker from "@src/worker/available-perks-checker?worker";
import BuildFinderWorker from "@src/worker/build-finder?worker";
import { useAtom, useAtomValue } from "jotai";
import kebabCase from "just-kebab-case";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { useParams } from "react-router-dom";
import { match } from "ts-pattern";

const buildLimit = 200;
const buildDisplayLimit = 50;

const findBuilds = async (
    weaponType: WeaponType | null,
    requestedPerks: AssignedPerkValue,
    maxBuilds: number,
    options: FinderItemDataOptions = {},
    useCache = true,
): Promise<BuildModel[]> => {
    const buildFinder = new BuildFinderWorker();

    const fetchBuilds = async () => {
        return new Promise<MatchingBuild[]>(resolve => {
            buildFinder.postMessage({ maxBuilds, options, requestedPerks, weaponType });

            buildFinder.addEventListener("message", message => {
                const builds = message.data;
                resolve(builds);
            });
        });
    };

    const builds = useCache
        ? await cacheAsync<MatchingBuild[]>("findBuilds", async () => await fetchBuilds(), [
            maxBuilds,
            options,
            requestedPerks,
            weaponType,
        ])
        : await fetchBuilds();

    return convertFindBuildResultsToBuildModel(builds);
};

type AvailablePerkCheckResult = { [perkName: string]: boolean };

const findAvailablePerks = async (
    weaponType: WeaponType | null,
    requestedPerks: AssignedPerkValue,
    perksToAdd: string[],
    options: FinderItemDataOptions = {},
    useCache = true,
): Promise<AvailablePerkCheckResult> => {
    const perkChecker = new AvailablePerksChecker();

    const checkAvailablePerks = async () => {
        return new Promise<AvailablePerkCheckResult>(resolve => {
            perkChecker.postMessage({ options, perksToAdd, requestedPerks, weaponType });

            perkChecker.addEventListener("message", message => {
                const results = message.data;
                resolve(results);
            });
        });
    };

    return useCache
        ? await cacheAsync<AvailablePerkCheckResult>("findAvailablePerks", async () => await checkAvailablePerks(), [
            perksToAdd,
            options,
            requestedPerks,
            weaponType,
        ])
        : await checkAvailablePerks();
};

const BuildFinder: React.FC = () => {
    const { t } = useTranslation();
    const params = useParams();

    const [
        {
            weaponType,
            selectedPerks,
            removeExotics,
            removeLegendary,
            pickerWeapon,
            pickerHead,
            pickerTorso,
            pickerArms,
            pickerLegs,
        },
        setFinder,
    ] = useAtom(finderAtom);
    const finderConfigString = useAtomValue(finderConfigView);

    const [configuration, setConfiguration] = useAtom(configurationAtom);
    const isMobile = useIsMobile();

    const [builds, setBuilds] = useState<BuildModel[]>([]);
    const [canPerkBeAdded, setCanPerkBeAdded] = useState<{ [perkName: string]: boolean }>({});
    const [isSearchingBuilds, setIsSearchingBuilds] = useState(false);
    const [isDeterminingSelectablePerks, setIsDeterminingSelectablePerks] = useState(false);
    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [itemSelectDialogOpen, setItemSelectDialogOpen] = useState(false);
    const [itemSelectDialogType, setItemSelectDialogType] = useState<ItemType>(ItemType.Weapon);
    const [itemSelectFilters, setItemSelectFilters] = useState<FilterFunc[]>([]);

    const finderOptions: FinderItemDataOptions = useMemo(
        () => ({
            pickerArms,
            pickerHead,
            pickerLegs,
            pickerTorso,
            pickerWeapon,
            removeExotics,
            removeLegendary,
        }),
        [removeExotics, removeLegendary, pickerWeapon, pickerHead, pickerTorso, pickerArms, pickerLegs],
    );

    const totalPerkCount = useMemo(() => Object.values(selectedPerks).reduce((sum, n) => sum + n, 0), [selectedPerks]);

    useEffect(() => {
        if (params.weaponType) {
            const urlWeaponType = findByKebabCaseName(params.weaponType);
            if (urlWeaponType) {
                setFinder(setBuildFinderWeaponType(urlWeaponType));
            }
        }

        if (params.finderConfig) {
            try {
                setFinder(applyFinderConfigString(params.finderConfig));
            } catch (err) {
                log.error("finder config from url error", { err });
            }
        }
    }, [params, setFinder]);

    useEffect(() => {
        const weapon = kebabCase(weaponType.toString());
        history.replaceState({}, "", `/b/finder/${weapon}/${finderConfigString}`);
    }, [weaponType, finderConfigString]);

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
        if (!configuration.finderPerkMatchingEnabled) {
            return;
        }

        const canBeAdded = async (
            builds: BuildModel[],
            perk: Perk,
        ): Promise<{ [perkName: string]: boolean | null }> => {
            const totalPerkValue = Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0);

            if (totalPerkValue >= 36) {
                return { [perk.name]: false };
            }

            if (perk.name in selectedPerks && selectedPerks[perk.name] >= 6) {
                return { [perk.name]: false };
            }

            const { pickerArms, pickerHead, pickerLegs, pickerTorso, pickerWeapon } = finderOptions;
            const pickerSelectedCount = [pickerArms, pickerHead, pickerLegs, pickerTorso, pickerWeapon].filter(
                p => !!p,
            ).length;

            if (pickerSelectedCount <= 3 && Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0) <= 18) {
                return { [perk.name]: true };
            }

            const perkAvailableInGeneratedBuilds = builds.some(build => {
                const buildPerks = perkData(build);
                const buildPerk = buildPerks.find(p => p.name === perk.name);

                if (!buildPerk) {
                    return false;
                }

                if (buildPerk.name in selectedPerks) {
                    return buildPerk.count === selectedPerks[buildPerk.name] + 3;
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

            // means we will do have to do a deep search later...
            return { [perk.name]: null };
        };

        const runWorkers = async () => {
            const newCanBeAddedMap = await cacheAsync(
                "finderPerksCanBeAdded",
                async () => {
                    log.timer("determineAvailablePerks");
                    const result = await Promise.all(
                        Object.values(perks)
                            .flat()
                            .map(perk => canBeAdded(builds, perk)),
                    );

                    let newCanBeAddedMap: { [perkName: string]: boolean | null } = {};

                    result.forEach(resultMap => {
                        newCanBeAddedMap = { ...newCanBeAddedMap, ...resultMap };
                    });

                    const deepSearchPerks = Object.entries(newCanBeAddedMap)
                        .filter(([_key, value]) => value === null)
                        .map(([key]) => key);

                    if (deepSearchPerks.length === 0) {
                        return newCanBeAddedMap;
                    }

                    const deepSearchPerksResult = await findAvailablePerks(
                        weaponType,
                        selectedPerks,
                        deepSearchPerks,
                        finderOptions,
                        false,
                    );

                    Object.entries(deepSearchPerksResult).forEach(([key, value]) => {
                        newCanBeAddedMap[key as keyof typeof newCanBeAddedMap] = value;
                    });

                    return newCanBeAddedMap;
                },
                [selectedPerks, weaponType, builds, finderOptions],
            );

            setCanPerkBeAdded(newCanBeAddedMap as { [perkName: string]: boolean });
            log.timerEnd("determineAvailablePerks");
            setIsDeterminingSelectablePerks(false);
        };

        setIsDeterminingSelectablePerks(true);
        runWorkers();
    }, [selectedPerks, weaponType, builds, finderOptions, configuration.finderPerkMatchingEnabled]);

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
            totalPerkCount < 36 &&
            (!configuration.finderPerkMatchingEnabled || (perk.name in canPerkBeAdded && canPerkBeAdded[perk.name])),
        [
            isDeterminingSelectablePerks,
            isSearchingBuilds,
            canPerkBeAdded,
            totalPerkCount,
            configuration.finderPerkMatchingEnabled,
        ],
    );

    const onPickerClicked = (itemType: ItemType) => {
        const filters = match(itemType)
            .with(
                ItemType.Weapon,
                () =>
                    [filterByWeaponType(weaponType), removeLegendary ? filterRemoveLegendaries() : null].filter(
                        f => !!f,
                    ) as FilterFunc[],
            )
            .with(ItemType.Head, () => [filterByArmourType(ArmourType.Head)])
            .with(ItemType.Torso, () => [filterByArmourType(ArmourType.Torso)])
            .with(ItemType.Arms, () => [filterByArmourType(ArmourType.Arms)])
            .with(ItemType.Legs, () => [filterByArmourType(ArmourType.Legs)])
            .otherwise(() => []);

        if (removeExotics) {
            filters.push(filterRemoveExotics());
        }

        setItemSelectFilters(filters);
        setItemSelectDialogType(itemType);
        setItemSelectDialogOpen(true);
    };

    return (
        <Stack
            spacing={2}
            sx={{ pb: 4 }}
        >
            <PageTitle title={t("pages.build-finder.title")} />

            <WeaponTypeSelector
                onChange={weaponType => {
                    setFinder(setBuildFinderWeaponType(weaponType));
                    setFinder(setPicker(ItemType.Weapon, null));
                }}
                value={weaponType}
            />
            <Typography variant="h5">{t("pages.build-finder.filter-title")}</Typography>

            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={removeExotics}
                            onChange={e => setFinder(setRemoveExotics(e.target.checked))}
                        />
                    }
                    label={t("pages.build-finder.remove-exotics")}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={removeLegendary}
                            onChange={e => setFinder(setRemoveLegendary(e.target.checked))}
                        />
                    }
                    label={t("pages.build-finder.remove-legendary")}
                />
            </FormGroup>

            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 2 : undefined}
            >
                <Typography variant="h5">{t("pages.build-finder.preselect-title")}</Typography>
                {!isMobile && <Box sx={{ flexGrow: 2 }} />}
                <Button
                    onClick={() => {
                        setFinder(setPicker(ItemType.Weapon, null));
                        setFinder(setPicker(ItemType.Head, null));
                        setFinder(setPicker(ItemType.Torso, null));
                        setFinder(setPicker(ItemType.Arms, null));
                        setFinder(setPicker(ItemType.Legs, null));
                    }}
                    startIcon={<Clear />}
                    variant={isMobile ? "outlined" : undefined}
                >
                    {t("pages.build-finder.clear-items")}
                </Button>
            </Stack>

            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
            >
                <MiniItemPicker
                    itemType={ItemType.Weapon}
                    onClick={onPickerClicked}
                    value={pickerWeapon}
                />
                <MiniItemPicker
                    itemType={ItemType.Head}
                    onClick={onPickerClicked}
                    value={pickerHead}
                />
                <MiniItemPicker
                    itemType={ItemType.Torso}
                    onClick={onPickerClicked}
                    value={pickerTorso}
                />
                <MiniItemPicker
                    itemType={ItemType.Arms}
                    onClick={onPickerClicked}
                    value={pickerArms}
                />
                <MiniItemPicker
                    itemType={ItemType.Legs}
                    onClick={onPickerClicked}
                    value={pickerLegs}
                />
            </Stack>

            <Typography variant="h5">{t("pages.build-finder.options-title")}</Typography>

            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={configuration.finderPerkMatchingEnabled}
                            onChange={e => setConfiguration(setFinderPerkMatching(e.target.checked))}
                        />
                    }
                    label={t("pages.build-finder.perk-matching-enabled")}
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
                            setFinder(clearPerks());
                            try {
                                const json = JSON.parse(input) as AssignedPerkValue;
                                for (const [perkName, value] of Object.entries(json)) {
                                    setFinder(setPerkValue({ perkName, value }));
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

            <FinderPerkPicker
                canAddPerk={canAddPerk}
                disabled={isDeterminingSelectablePerks}
            />

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

            <ItemSelectDialog
                disablePowerSurgeSelection
                handleClose={() => setItemSelectDialogOpen(false)}
                itemType={itemSelectDialogType}
                onItemSelected={(item, itemType, _isPowerSurged) => {
                    setFinder(setPicker(itemType, item as Weapon | Armour | null));
                    setItemSelectDialogOpen(false);
                }}
                open={itemSelectDialogOpen}
                preDefinedFilters={itemSelectFilters}
            />
        </Stack>
    );
};

export default BuildFinder;
