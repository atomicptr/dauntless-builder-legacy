import metaBuildsJson from "@json/meta-builds.json";
import trialsBuildsJson from "@json/trials-builds.json";
import { ArrowRight } from "@mui/icons-material";
import { Alert, Box, ListSubheader, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import LinkBox from "@src/components/LinkBox";
import PageTitle from "@src/components/PageTitle";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { BuildModel } from "@src/data/BuildModel";
import { ElementalType } from "@src/data/ElementalType";
import { WeaponType } from "@src/data/Weapon";
import {
    removeNote,
    selectMetaBuildsSelection,
    setBuildCategoryIndex,
    setMetaBuildsWeaponType,
} from "@src/features/meta-builds-selection/meta-builds-selection-slice";
import { useCache } from "@src/hooks/cache";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => (
    <Box
        hidden={value !== index}
        role="tabpanel"
    >
        {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </Box>
);

interface BuildCategory {
    index: number;
    name: string;
    tier: number | null;
    description: string;
    builds: BuildCategoryBuild[];
    subcategoryDescription: {
        [subcategory: string]: string;
    };
}

interface BuildCategoryBuild {
    title: string;
    buildId: string;
    subcategory: string | null;
    vsElement: ElementalType | null;
}

const trialsCategoryName = "Trials";

const MetaBuilds: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const { weaponType, buildCategoryIndex, showNote } = useAppSelector(selectMetaBuildsSelection);

    const categories = useMemo(() => metaBuildsJson.categories.map(c => c.name).concat([trialsCategoryName]), []);

    const builds = useCache(
        "metabuilds-builds",
        () => {
            type WeaponBuilds = {
                [categoryName: string]: BuildCategory;
            };

            const builds = {
                [WeaponType.AetherStrikers]: {} as WeaponBuilds,
                [WeaponType.Axe]: {} as WeaponBuilds,
                [WeaponType.ChainBlades]: {} as WeaponBuilds,
                [WeaponType.Hammer]: {} as WeaponBuilds,
                [WeaponType.Repeater]: {} as WeaponBuilds,
                [WeaponType.Sword]: {} as WeaponBuilds,
                [WeaponType.WarPike]: {} as WeaponBuilds,
            };

            for (const category of metaBuildsJson.categories) {
                for (const buildData of category.builds) {
                    const build = BuildModel.tryDeserialize(buildData.buildId);

                    const weaponType = build.data.weapon?.type;

                    if (!weaponType) {
                        continue;
                    }

                    if (!(category.name in builds[weaponType])) {
                        builds[weaponType][category.name] = {
                            builds: [],
                            description: category.description,
                            index: category.index,
                            name: category.name,
                            subcategoryDescription: category.subcategoryDescription ?? {},
                            tier: category.tier ?? null,
                        };
                    }

                    builds[weaponType][category.name].builds.push({
                        buildId: build.serialize(),
                        subcategory: buildData.subcategory ?? null,
                        title: buildData.title,
                        vsElement: buildData.vsElement as ElementalType | null,
                    });
                }
            }

            for (const behemoth of trialsBuildsJson.behemoths) {
                for (const buildId of behemoth.builds) {
                    const build = BuildModel.tryDeserialize(buildId);

                    const weaponType = build.data.weapon?.type;

                    if (!weaponType) {
                        continue;
                    }

                    if (!(trialsCategoryName in builds[weaponType])) {
                        const subcategoryDescription: {
                            [name: string]: string;
                        } = {};

                        trialsBuildsJson.behemoths.forEach(behemoth => {
                            subcategoryDescription[behemoth.title] = (behemoth.tips?.length ?? 0).toString();
                        });

                        builds[weaponType][trialsCategoryName] = {
                            builds: [],
                            description: "",
                            index: 99,
                            name: trialsCategoryName,
                            subcategoryDescription,
                            tier: null,
                        };
                    }

                    builds[weaponType][trialsCategoryName].builds.push({
                        buildId: build.serialize(),
                        subcategory: behemoth.title,
                        title: behemoth.title,
                        vsElement: null,
                    });
                }
            }

            return builds;
        },
        [metaBuildsJson, trialsBuildsJson],
    );

    const buildsForWeapon = useMemo(() => (weaponType in builds ? builds[weaponType] : {}), [builds, weaponType]);

    const hasBuilds = useCallback(
        (category: string): boolean =>
            weaponType !== null && category in buildsForWeapon && buildsForWeapon[category].builds.length > 0,
        [weaponType, buildsForWeapon],
    );

    const currentCategory = useMemo(
        () => (categories[buildCategoryIndex] ? categories[buildCategoryIndex] : null),
        [categories, buildCategoryIndex],
    );

    const subcategories = useMemo(
        () =>
            weaponType !== null && currentCategory !== null && currentCategory in buildsForWeapon
                ? buildsForWeapon[currentCategory].builds
                    .map(build => build.subcategory)
                    .filter(category => !!category)
                    .filter((value, index, self) => self.indexOf(value) === index)
                : [],
        [weaponType, currentCategory, buildsForWeapon],
    );

    // fix some weapon types not having access to all categories
    useEffect(() => {
        const currentCategory = metaBuildsJson.categories[buildCategoryIndex];

        if (!currentCategory) {
            return;
        }

        if (hasBuilds(currentCategory.name)) {
            return;
        }

        for (let i = 0; i < metaBuildsJson.categories.length; i++) {
            const category = metaBuildsJson.categories[i];

            if (hasBuilds(category.name)) {
                dispatch(setBuildCategoryIndex(i));
                return;
            }
        }
    }, [buildCategoryIndex, weaponType, hasBuilds, dispatch]);

    const categoryTranslate = useCallback(
        (defaultKey: string, trialsKey?: string, category: string | null = currentCategory) => {
            category ??= currentCategory;
            if (trialsKey && category === trialsCategoryName) {
                return t(trialsKey);
            }
            return t(defaultKey);
        },
        [t, currentCategory],
    );

    const renderBuild = useCallback(
        (index: number, buildId: string, title: string) => (
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
                        <BuildCard
                            buildId={buildId}
                            title={
                                currentCategory === trialsCategoryName
                                    ? undefined
                                    : (t(`pages.metabuilds.generated.buildTitles.${title}`) as string)
                            }
                        />
                    </Box>
                </LazyLoadComponent>
            </Box>
        ),
        [t, currentCategory],
    );

    const renderBuildsByElement = useCallback(
        (builds: BuildCategoryBuild[]) => {
            const buildsByElement = {
                [ElementalType.Blaze]: [] as BuildCategoryBuild[],
                [ElementalType.Frost]: [] as BuildCategoryBuild[],
                [ElementalType.Terra]: [] as BuildCategoryBuild[],
                [ElementalType.Shock]: [] as BuildCategoryBuild[],
                [ElementalType.Radiant]: [] as BuildCategoryBuild[],
                [ElementalType.Umbral]: [] as BuildCategoryBuild[],
                None: [] as BuildCategoryBuild[],
            };

            builds.forEach(build => {
                const element = build.vsElement ?? "None";
                buildsByElement[element].push(build);
            });

            return (
                <>
                    {buildsByElement[ElementalType.Blaze].length > 0 && (
                        <>
                            <ListSubheader>{t("pages.metabuilds.vsElement.Blaze")}</ListSubheader>

                            <Stack
                                spacing={2}
                                sx={{ mt: 2 }}
                            >
                                {buildsByElement[ElementalType.Blaze].map((build, index) =>
                                    renderBuild(index, build.buildId, build.title),
                                )}
                            </Stack>
                        </>
                    )}

                    {buildsByElement[ElementalType.Frost].length > 0 && (
                        <>
                            <ListSubheader>{t("pages.metabuilds.vsElement.Frost")}</ListSubheader>

                            <Stack
                                spacing={2}
                                sx={{ mt: 2 }}
                            >
                                {buildsByElement[ElementalType.Frost].map((build, index) =>
                                    renderBuild(index, build.buildId, build.title),
                                )}
                            </Stack>
                        </>
                    )}

                    {buildsByElement[ElementalType.Terra].length > 0 && (
                        <>
                            <ListSubheader>{t("pages.metabuilds.vsElement.Terra")}</ListSubheader>

                            <Stack
                                spacing={2}
                                sx={{ mt: 2 }}
                            >
                                {buildsByElement[ElementalType.Terra].map((build, index) =>
                                    renderBuild(index, build.buildId, build.title),
                                )}
                            </Stack>
                        </>
                    )}

                    {buildsByElement[ElementalType.Shock].length > 0 && (
                        <>
                            <ListSubheader>{t("pages.metabuilds.vsElement.Shock")}</ListSubheader>

                            <Stack
                                spacing={2}
                                sx={{ mt: 2 }}
                            >
                                {buildsByElement[ElementalType.Shock].map((build, index) =>
                                    renderBuild(index, build.buildId, build.title),
                                )}
                            </Stack>
                        </>
                    )}

                    {buildsByElement[ElementalType.Radiant].length > 0 && (
                        <>
                            <ListSubheader>{t("pages.metabuilds.vsElement.Radiant")}</ListSubheader>

                            <Stack
                                spacing={2}
                                sx={{ mt: 2 }}
                            >
                                {buildsByElement[ElementalType.Radiant].map((build, index) =>
                                    renderBuild(index, build.buildId, build.title),
                                )}
                            </Stack>
                        </>
                    )}

                    {buildsByElement[ElementalType.Umbral].length > 0 && (
                        <>
                            <ListSubheader>{t("pages.metabuilds.vsElement.Umbral")}</ListSubheader>

                            <Stack
                                spacing={2}
                                sx={{ mt: 2 }}
                            >
                                {buildsByElement[ElementalType.Umbral].map((build, index) =>
                                    renderBuild(index, build.buildId, build.title),
                                )}
                            </Stack>
                        </>
                    )}

                    {buildsByElement["None"].length > 0 && (
                        <Stack
                            spacing={2}
                            sx={{ mt: 2 }}
                        >
                            {buildsByElement["None"].map((build, index) =>
                                renderBuild(index, build.buildId, build.title),
                            )}
                        </Stack>
                    )}
                </>
            );
        },
        [renderBuild, t],
    );

    const renderSubcategories = (buildCategory: BuildCategory) => (
        <>
            {subcategories.length > 0
                ? subcategories.map(subcategory => (
                    <Box key={subcategory}>
                        <Typography
                            sx={{ my: 2 }}
                            variant="h5"
                        >
                            {categoryTranslate(
                                `pages.metabuilds.subcategories.${subcategory}`,
                                `terms.behemoths.${subcategory}`,
                            )}
                        </Typography>

                        {subcategory !== null &&
                              subcategory in buildCategory.subcategoryDescription &&
                              (buildCategory.name === trialsCategoryName ? (
                                  new Array(Number(buildCategory.subcategoryDescription[subcategory]))
                                      .fill(null)
                                      .map((_, index) => (
                                          <Typography
                                              key={index}
                                              sx={{ alignItems: "center", display: "flex", mb: 2 }}
                                          >
                                              <ArrowRight /> 
                                              {" "}
                                              {t(`pages.trials.generated.tips.${subcategory}.${index}`)}
                                          </Typography>
                                      ))
                              ) : (
                                  <Typography sx={{ mb: 2 }}>
                                      {t(
                                          `pages.metabuilds.generated.categories.${buildCategory.name}.subcategoryDescription.${subcategory}`,
                                      )}
                                  </Typography>
                              ))}

                        <Stack
                            spacing={2}
                            sx={{ mt: 2 }}
                        >
                            {renderBuildsByElement(
                                buildCategory.builds.filter(build => build.subcategory === subcategory),
                            )}
                        </Stack>
                    </Box>
                ))
                : renderBuildsByElement(buildCategory.builds)}

            {subcategories.length > 0 && (
                <Stack
                    spacing={2}
                    sx={{ mt: 2 }}
                >
                    {renderBuildsByElement(buildCategory.builds.filter(build => build.subcategory === null))}
                </Stack>
            )}
        </>
    );

    return (
        <Stack spacing={2}>
            <PageTitle title={t("pages.metabuilds.title")} />

            {showNote && (
                <Alert
                    onClose={() => dispatch(removeNote())}
                    severity="info"
                >
                    <LinkBox
                        text={t("pages.metabuilds.note", {
                            officialDiscordServer: "https://discord.com/invite/dauntless",
                            spreadsheetLink: "https://bit.ly/DauntlessMeta",
                        })}
                    />
                </Alert>
            )}

            <WeaponTypeSelector
                onChange={weaponType => dispatch(setMetaBuildsWeaponType(weaponType))}
                value={weaponType}
            />

            <Box>
                <Box>
                    <Tabs
                        allowScrollButtonsMobile
                        onChange={(_ev, category) => dispatch(setBuildCategoryIndex(category))}
                        scrollButtons
                        value={buildCategoryIndex}
                        variant="scrollable"
                    >
                        {categories.map((category, index) => (
                            <Tab
                                key={index}
                                disabled={!hasBuilds(category)}
                                label={categoryTranslate(
                                    `pages.metabuilds.generated.categories.${category}.name`,
                                    "pages.trials.title",
                                    category,
                                )}
                            />
                        ))}
                    </Tabs>
                </Box>
                {categories.map((category, index) => (
                    <TabPanel
                        key={index}
                        index={index}
                        value={buildCategoryIndex}
                    >
                        {category in buildsForWeapon && (
                            <>
                                <Typography>
                                    {categoryTranslate(
                                        `pages.metabuilds.generated.categories.${category}.description`,
                                        "pages.trials.description",
                                        category,
                                    )}
                                </Typography>

                                <Stack
                                    spacing={2}
                                    sx={{ mt: 2 }}
                                >
                                    {renderSubcategories(buildsForWeapon[category])}
                                </Stack>
                            </>
                        )}
                    </TabPanel>
                ))}
            </Box>
        </Stack>
    );
};

export default MetaBuilds;
