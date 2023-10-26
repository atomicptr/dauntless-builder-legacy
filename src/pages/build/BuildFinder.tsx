import { Box, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, Typography } from "@mui/material";
import FinderBuildList from "@src/components/FinderBuildList";
import FinderDevMenu from "@src/components/FinderDevMenu";
import FinderItemPreselect from "@src/components/FinderItemPreselect";
import FinderPerkPicker from "@src/components/FinderPerkPicker";
import PageTitle from "@src/components/PageTitle";
import { perkData } from "@src/components/PerkList";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { BuildModel } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import { findByKebabCaseName, WeaponType } from "@src/data/Weapon";
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
    finderAtom,
    finderConfigView,
    setBuildFinderWeaponType,
    setPicker,
    setRemoveExotics,
    setRemoveLegendary,
} from "@src/state/finder";
import log from "@src/utils/logger";
import AvailablePerksChecker from "@src/worker/available-perks-checker?worker";
import BuildFinderWorker from "@src/worker/build-finder?worker";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import kebabCase from "just-kebab-case";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const buildLimit = 200;
export const buildDisplayLimit = 50;

const findBuilds = async (
    weaponType: WeaponType | null,
    requestedPerks: AssignedPerkValue,
    maxBuilds: number,
    options: FinderItemDataOptions = {},
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

    const builds = await fetchBuilds();

    return convertFindBuildResultsToBuildModel(builds);
};

type AvailablePerkCheckResult = { [perkName: string]: boolean };

const findAvailablePerks = async (
    weaponType: WeaponType | null,
    requestedPerks: AssignedPerkValue,
    perksToAdd: string[],
    options: FinderItemDataOptions = {},
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

    return await checkAvailablePerks();
};

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

export const BuildsContext = React.createContext<BuildModel[]>([]);

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

    const { isPending: isSearchingBuilds, data: builds } = useQuery({
        queryFn: async () => {
            log.timer("findBuilds");
            const builds = await findBuilds(weaponType, selectedPerks, buildLimit, finderOptions);
            log.timerEnd("findBuilds");
            log.debug(`Found ${builds.length} builds for given criteria`, { selectedPerks });
            return builds;
        },
        queryKey: ["findBuilds", weaponType, selectedPerks, finderOptions],
    });

    const { isPending: isDeterminingSelectablePerks, data: canPerkBeAdded } = useQuery({
        queryFn: async () => {
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

                if (
                    pickerSelectedCount <= 3 &&
                    Object.values(selectedPerks).reduce((prev, cur) => prev + cur, 0) <= 18
                ) {
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

            log.timer("determineAvailablePerks");
            const result = await Promise.all(
                Object.values(perks)
                    .flat()
                    .map(perk => canBeAdded(builds ?? [], perk)),
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
            );

            Object.entries(deepSearchPerksResult).forEach(([key, value]) => {
                newCanBeAddedMap[key as keyof typeof newCanBeAddedMap] = value;
            });

            log.timerEnd("determineAvailablePerks");
            return newCanBeAddedMap as unknown as { [perkName: string]: boolean };
        },
        queryKey: [
            "determineAvailablePerks",
            selectedPerks,
            weaponType,
            builds,
            finderOptions,
            configuration.finderPerkMatchingEnabled,
        ],
    });

    const canAddPerk = useCallback(
        (perk: Perk): boolean =>
            (!isDeterminingSelectablePerks &&
                !isSearchingBuilds &&
                totalPerkCount < 36 &&
                !configuration.finderPerkMatchingEnabled) ||
            (perk.name in (canPerkBeAdded ?? {}) && ((canPerkBeAdded ?? {})[perk.name] ?? false)),
        [
            isDeterminingSelectablePerks,
            isSearchingBuilds,
            canPerkBeAdded,
            totalPerkCount,
            configuration.finderPerkMatchingEnabled,
        ],
    );

    return (
        <BuildsContext.Provider value={builds ?? []}>
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

                <FinderItemPreselect />

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

                <FinderDevMenu />

                <FinderPerkPicker
                    canAddPerk={canAddPerk}
                    disabled={isDeterminingSelectablePerks}
                />

                {isDeterminingSelectablePerks || isSearchingBuilds ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                    >
                        <CircularProgress />
                    </Box>
                ) : null}

                {!isDeterminingSelectablePerks && !isSearchingBuilds && Object.keys(selectedPerks).length > 0 ? (
                    <FinderBuildList />
                ) : null}
            </Stack>
        </BuildsContext.Provider>
    );
};
export default BuildFinder;
