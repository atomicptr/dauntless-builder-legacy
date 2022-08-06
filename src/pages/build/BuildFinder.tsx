import { Clear, Error } from "@mui/icons-material";
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
    IconButton,
    InputAdornment,
    LinearProgress,
    OutlinedInput,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import BuildCard from "@src/components/BuildCard";
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
import PerkTooltip from "@src/components/PerkTooltip";
import RarityCard from "@src/components/RarityCard";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { ItemRarity } from "@src/data/ItemRarity";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import { Weapon, WeaponType } from "@src/data/Weapon";
import {
    AssignedPerkValue,
    clearPerks,
    selectBuildFinderSelection,
    setBuildFinderWeaponType,
    setPerkValue,
    setPicker,
    setRemoveExotics,
    setRemoveLegendary,
} from "@src/features/build-finder/build-finder-selection-slice";
import {
    convertFindBuildResultsToBuildModel,
    FinderItemDataOptions,
    MatchingBuild,
    perks,
} from "@src/features/build-finder/find-builds";
import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import { cacheAsync } from "@src/hooks/cache";
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
import { match } from "ts-pattern";

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
    useCache = true,
): Promise<BuildModel[]> => {
    const buildFinder = webworkerDisabled ? null : new BuildFinderWorker();

    if (buildFinder === null) {
        log.warn("Web Worker based build finder is currently disabled due to not using Chrome!");
        return Promise.resolve([]);
    }

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

const BuildFinder: React.FC = () => {
    const isLightMode = useIsLightMode();
    const { t } = useTranslation();

    const {
        weaponType,
        selectedPerks,
        removeExotics,
        removeLegendary,
        pickerWeapon,
        pickerHead,
        pickerTorso,
        pickerArms,
        pickerLegs,
    } = useAppSelector(selectBuildFinderSelection);
    const configuration = useAppSelector(selectConfiguration);
    const isMobile = useIsMobile();

    const [builds, setBuilds] = useState<BuildModel[]>([]);
    const [canPerkBeAdded, setCanPerkBeAdded] = useState<{ [perkName: string]: boolean }>({});
    const [isSearchingBuilds, setIsSearchingBuilds] = useState(false);
    const [isDeterminingSelectablePerks, setIsDeterminingSelectablePerks] = useState(false);
    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [itemSelectDialogOpen, setItemSelectDialogOpen] = useState(false);
    const [itemSelectDialogType, setItemSelectDialogType] = useState<ItemType>(ItemType.Weapon);
    const [itemSelectFilters, setItemSelectFilters] = useState<FilterFunc[]>([]);
    const [perkSearch, setPerkSearch] = useState("");

    const dispatch = useAppDispatch();

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
            const newCanBeAddedMap = await cacheAsync(
                "finderPerksCanBeAdded",
                async () => {
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

                    return newCanBeAddedMap;
                },
                [selectedPerks, weaponType, finderOptions],
            );

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

    const renderToolTip = useCallback(
        (perk: Perk, count: number) => (
            <PerkTooltip
                count={count}
                perk={perk}
                withDescription
            />
        ),
        [],
    );

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
                onChange={weaponType => {
                    dispatch(setBuildFinderWeaponType(weaponType));
                    dispatch(setPicker({ item: null, itemType: ItemType.Weapon }));
                }}
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

            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 2 : undefined}
            >
                <Typography variant="h5">{t("pages.build-finder.preselect-title")}</Typography>
                {!isMobile && <Box sx={{ flexGrow: 2 }} />}
                <Button
                    onClick={() => {
                        dispatch(setPicker({ item: null, itemType: ItemType.Weapon }));
                        dispatch(setPicker({ item: null, itemType: ItemType.Head }));
                        dispatch(setPicker({ item: null, itemType: ItemType.Torso }));
                        dispatch(setPicker({ item: null, itemType: ItemType.Arms }));
                        dispatch(setPicker({ item: null, itemType: ItemType.Legs }));
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

            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 2 : undefined}
            >
                <Typography variant="h5">{t("pages.build-finder.perks-title")}</Typography>
                {!isMobile && <Box sx={{ flexGrow: 2 }} />}
                <Button
                    onClick={() => {
                        dispatch(clearPerks());
                        setPerkSearch("");
                    }}
                    startIcon={<Clear />}
                    variant={isMobile ? "outlined" : undefined}
                >
                    {t("pages.build-finder.clear-perks")}
                </Button>
            </Stack>

            {isDeterminingSelectablePerks ? <LinearProgress /> : null}

            <OutlinedInput
                endAdornment={
                    perkSearch.length > 0 ? (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setPerkSearch("")}>
                                <Clear />
                            </IconButton>
                        </InputAdornment>
                    ) : undefined
                }
                onChange={ev => setPerkSearch(ev.target.value)}
                placeholder={t("pages.build-finder.filter-perks")}
                value={perkSearch}
            />

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

                            {perks[cellType as keyof typeof perks].map(
                                (perk: Perk) =>
                                    (perkSearch.length === 0 ||
                                        perk.name.toLowerCase().indexOf(perkSearch.toLowerCase()) > -1) && (
                                        <Stack
                                            key={perk.name}
                                            direction="row"
                                            spacing={1}
                                        >
                                            <Tooltip
                                                arrow
                                                followCursor
                                                title={renderToolTip(perk, selectedPerks[perk.name] ?? 0)}
                                            >
                                                <RarityCard
                                                    disabled={!canAddPerk(perk)}
                                                    elevation={canAddPerk(perk) ? 1 : 0}
                                                    rarity={
                                                        selectedPerks[perk.name] === 6
                                                            ? ItemRarity.Epic
                                                            : selectedPerks[perk.name] === 3
                                                                ? ItemRarity.Uncommon
                                                                : undefined
                                                    }
                                                    sx={{ flexGrow: 2 }}
                                                >
                                                    <CardActionArea
                                                        disabled={!canAddPerk(perk)}
                                                        onClick={() => onPerkClicked(perk)}
                                                    >
                                                        <CardContent>
                                                            {t(
                                                                itemTranslationIdentifier(
                                                                    ItemType.Perk,
                                                                    perk.name,
                                                                    "name",
                                                                ),
                                                            )}
                                                            {" "}
                                                            {renderPerkLevel(perk)}
                                                        </CardContent>
                                                    </CardActionArea>
                                                </RarityCard>
                                            </Tooltip>

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
                                    ),
                            )}
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

            <ItemSelectDialog
                disablePowerSurgeSelection
                handleClose={() => setItemSelectDialogOpen(false)}
                itemType={itemSelectDialogType}
                onItemSelected={(item, itemType, _isPowerSurged) => {
                    dispatch(setPicker({ item: item as Weapon | Armour | null, itemType }));
                    setItemSelectDialogOpen(false);
                }}
                open={itemSelectDialogOpen}
                preDefinedFilters={itemSelectFilters}
            />
        </Stack>
    );
};

export default BuildFinder;
