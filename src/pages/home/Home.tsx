import { GitHub, Translate } from "@mui/icons-material";
import { Button, Grid, Stack, Typography } from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import LinkBox from "@src/components/LinkBox";
import PageTitle from "@src/components/PageTitle";
import { crowdinLink, discordServerUrl, githubUrl, matrixChannelUrl } from "@src/constants";
import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import { selectFavorites } from "@src/features/favorites/favorites-slice";
import { useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";
import { SiMatrix } from "react-icons/all";
import { FaDiscord } from "react-icons/fa";

const numberOfBuilds = 5;

const testBuilds = [
    "0VfrT2mCZCkBHjhjcjUaTVTvETbC8zH0RToCggUAVtVCRtjot6CndsmfxXTe",
    "LWfOTy0uzCzTdTZTvTQT5TzpIMCrbUgWcdCeyCngHMCKtBRt2CZKFkfzgsw",
    "Brf8TNQi3C1yfjqUViOhjIWOsJaFkCdBU71SVC6KFgtJCL8UjxtOCjwuEu2Oc3",
    "EQfPT2fNC0VFQ5frFgu6T5ToeIJC3EIOkfoC03SZrTbCmZHBquBCj0sLSonUE",
];

const Home: React.FC = () => {
    const { t } = useTranslation();
    const configuration = useAppSelector(selectConfiguration);
    const favorites = useAppSelector(selectFavorites);

    return (
        <Grid
            container
            spacing={2}
        >
            <Grid
                item
                md={8}
                xs={12}
            >
                <PageTitle
                    hidden
                    title={t("pages.home.title")}
                />
                <Stack
                    direction="column"
                    spacing={2}
                    sx={{ mt: 1, pr: 2 }}
                >
                    <Typography
                        component="h1"
                        sx={{ mb: 1 }}
                        variant="h5"
                    >
                        {t("pages.home.welcome-title")}
                    </Typography>
                    <Typography>{t("pages.home.welcome-text")}</Typography>

                    <Typography
                        sx={{ mb: 1 }}
                        variant="h6"
                    >
                        {t("pages.home.localization-title")}
                    </Typography>

                    <Typography>{t("pages.home.localization-text")}</Typography>

                    <Typography
                        sx={{ mb: 1 }}
                        variant="h6"
                    >
                        {t("pages.home.contributing-title")}
                    </Typography>

                    <Typography>
                        <LinkBox text={t("pages.home.contributing-text", { githubUrl })} />
                    </Typography>

                    <Typography
                        sx={{ mb: 1 }}
                        variant="h6"
                    >
                        {t("pages.home.links-title")}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={2}
                    >
                        <Button
                            component="a"
                            href={githubUrl}
                            startIcon={<GitHub />}
                            target="_blank"
                        >
                            {t("pages.home.links.github")}
                        </Button>
                        <Button
                            component="a"
                            href={matrixChannelUrl}
                            startIcon={<SiMatrix />}
                            target="_blank"
                        >
                            {t("pages.home.links.matrix")}
                        </Button>
                        <Button
                            component="a"
                            href={discordServerUrl}
                            startIcon={<FaDiscord />}
                            target="_blank"
                        >
                            {t("pages.home.links.discord")}
                        </Button>
                        <Button
                            component="a"
                            href={crowdinLink}
                            startIcon={<Translate />}
                            target="_blank"
                        >
                            {t("pages.home.links.localize")}
                        </Button>
                    </Stack>
                </Stack>
            </Grid>

            <Grid
                item
                md={4}
                xs={12}
            >
                {favorites.length > 0 ? (
                    <>
                        <Typography
                            sx={{ mb: 1 }}
                            variant="h5"
                        >
                            {t("pages.favorites.title")}
                        </Typography>

                        <Stack spacing={1}>
                            {favorites.slice(0, numberOfBuilds).map((fav, index) => (
                                <BuildCard
                                    key={index}
                                    buildId={fav.buildId}
                                    miniMode
                                    title={fav.name}
                                />
                            ))}
                        </Stack>
                    </>
                ) : null}

                {configuration.devMode ? (
                    <Stack
                        direction="column"
                        spacing={2}
                        sx={{ mt: 2 }}
                    >
                        <Typography
                            sx={{ mb: 1 }}
                            variant="h5"
                        >
                            {t("pages.home.test-builds")}
                        </Typography>

                        <Stack
                            spacing={1}
                            sx={{ mt: "0 !important" }}
                        >
                            {testBuilds.map((buildId, index) => (
                                <BuildCard
                                    key={index}
                                    buildId={buildId}
                                    miniMode
                                    title={`Test Build #${index + 1}: {{omnicellName}} / {{weaponName}}`}
                                />
                            ))}
                        </Stack>
                    </Stack>
                ) : null}
            </Grid>
        </Grid>
    );
};

export default Home;
