import { Box, Grid, Stack, Typography } from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import PageTitle from "@src/components/PageTitle";
import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import { selectFavorites } from "@src/features/favorites/favorites-slice";
import { useAppSelector } from "@src/hooks/redux";
import React from "react";
import { useTranslation } from "react-i18next";

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
                <PageTitle title={t("pages.home.title")} />
                <Box sx={{ mt: 1 }}>
                    {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur pellentesque maximus congue. Duis
                    et lorem vel odio egestas porta. Vestibulum eu fermentum libero. Etiam vehicula erat leo, eu
                    fringilla arcu porttitor vitae. Maecenas id laoreet neque, et tristique orci. Morbi eu sollicitudin
                    nunc. In feugiat ligula eget risus rutrum, eget ornare lorem interdum. Fusce eget euismod augue.
                    Vestibulum porta congue nisi a finibus. Cras suscipit mauris lorem, auctor egestas nisi mattis nec.
                    Integer elementum justo et massa vehicula hendrerit. Integer tellus odio, vehicula id ex cursus,
                    bibendum laoreet dolor. In auctor purus a libero posuere, vel elementum tortor elementum. Aenean
                    rhoncus posuere neque, at malesuada ante vehicula non. Nullam id lacus in magna faucibus vulputate.
                    Etiam ac scelerisque ipsum. Nunc interdum arcu ac commodo dignissim. Pellentesque sit amet viverra
                    turpis. Donec at sollicitudin turpis. Proin arcu sapien, porta eu ligula id, pulvinar semper massa.
                    Sed felis dolor, mollis non libero at, vestibulum fermentum neque. Integer tellus mauris, auctor et
                    faucibus at, pharetra eget ante. Vestibulum at justo aliquam nisl tincidunt vulputate. Etiam
                    fermentum sodales turpis ut semper. Sed mollis est sit amet quam dictum porttitor. Sed placerat ut
                    libero nec tristique. Vestibulum pellentesque augue at sapien ultricies, non imperdiet nisl feugiat.
                    Fusce facilisis efficitur massa eu tempus.`}
                </Box>
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
