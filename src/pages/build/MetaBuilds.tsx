import { Alert, Box, ListSubheader, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import PageTitle from "@src/components/PageTitle";
import WeaponTypeSelector from "@src/components/WeaponTypeSelector";
import { BuildModel } from "@src/data/BuildModel";
import { ElementalType } from "@src/data/ElementalType";
import { WeaponType } from "@src/data/Weapon";
import {
    removeNote,
    selectMetaBuildsSelection,
    setBuildCategoryIndex,
    setWeaponType,
} from "@src/features/meta-builds-selection/meta-builds-selection-slice";
import useCache from "@src/hooks/cache";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import React, { ReactNode, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";

import metaBuildsJson from "./meta-builds.json";

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

const MetaBuilds: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const { weaponType, buildCategoryIndex, showNote } = useAppSelector(selectMetaBuildsSelection);

    const builds = useCache("metabuilds-builds", () => {
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

        return builds;
    });

    const hasBuilds = useCallback(
        (category: string): boolean =>
            weaponType !== null && category in builds[weaponType] && builds[weaponType][category].builds.length > 0,
        [weaponType, builds],
    );

    const currentCategory = metaBuildsJson.categories[buildCategoryIndex]
        ? metaBuildsJson.categories[buildCategoryIndex]
        : null;

    const subcategories =
        weaponType !== null && currentCategory !== null && currentCategory.name in builds[weaponType]
            ? builds[weaponType][currentCategory.name].builds
                .map(build => build.subcategory)
                .filter(category => !!category)
                .filter((value, index, self) => self.indexOf(value) === index)
            : [];

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

    const renderBuild = (index: number, buildId: string, title: string) => (
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
                        title={t(`pages.metabuilds.generated.buildTitles.${title}`)}
                    />
                </Box>
            </LazyLoadComponent>
        </Box>
    );

    const renderBuildsByElement = (builds: BuildCategoryBuild[]) => {
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
                        {buildsByElement["None"].map((build, index) => renderBuild(index, build.buildId, build.title))}
                    </Stack>
                )}
            </>
        );
    };

    const renderSubcategories = (buildCategory: BuildCategory) => (
        <>
            {subcategories.length > 0
                ? subcategories.map(subcategory => (
                    <Box key={subcategory}>
                        <Typography
                            sx={{ my: 2 }}
                            variant="h5"
                        >
                            {t(`pages.metabuilds.subcategories.${subcategory}`)}
                        </Typography>

                        {subcategory !== null && subcategory in buildCategory.subcategoryDescription && (
                            <Typography sx={{ mb: 2 }}>
                                {t(
                                    `pages.metabuilds.generated.categories.${buildCategory.name}.subcategoryDescription.${subcategory}`,
                                )}
                            </Typography>
                        )}

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
                    <div
                        dangerouslySetInnerHTML={{
                            __html: t("pages.metabuilds.note", {
                                officialDiscordServer: "https://discord.com/invite/dauntless",
                                spreadsheetLink: "https://bit.ly/DauntlessMeta",
                            }),
                        }}
                    />
                </Alert>
            )}

            <WeaponTypeSelector
                onChange={weaponType => dispatch(setWeaponType(weaponType))}
                value={weaponType}
            />

            {weaponType === null && (
                <Box>
                    <Typography>{t("pages.metabuilds.select-weapon-first")}</Typography>
                </Box>
            )}

            {weaponType !== null && (
                <Box>
                    <Box>
                        <Tabs
                            allowScrollButtonsMobile
                            onChange={(_ev, category) => dispatch(setBuildCategoryIndex(category))}
                            scrollButtons
                            value={buildCategoryIndex}
                            variant="scrollable"
                        >
                            {metaBuildsJson.categories.map((category, index) => (
                                <Tab
                                    key={index}
                                    disabled={!hasBuilds(category.name)}
                                    label={t(`pages.metabuilds.generated.categories.${category.name}.name`)}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    {metaBuildsJson.categories.map((category, index) => (
                        <TabPanel
                            key={index}
                            index={index}
                            value={buildCategoryIndex}
                        >
                            {category.name in builds[weaponType] && (
                                <>
                                    <Typography>
                                        {t(`pages.metabuilds.generated.categories.${category.name}.description`)}
                                    </Typography>

                                    <Stack
                                        spacing={2}
                                        sx={{ mt: 2 }}
                                    >
                                        {renderSubcategories(builds[weaponType][category.name])}
                                    </Stack>
                                </>
                            )}
                        </TabPanel>
                    ))}
                </Box>
            )}
        </Stack>
    );
};

export default MetaBuilds;
