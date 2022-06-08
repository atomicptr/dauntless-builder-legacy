import { GitHub } from "@mui/icons-material";
import { Avatar, Box, Button, Card, CardActionArea, CardContent, Grid, Stack, Typography } from "@mui/material";
import PageTitle from "@src/components/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

import contributorsJson from "./contributors.json";
import dependenciesJson from "./dependencies.json";

export interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
    contributions: number;
}

export interface Dependency {
    name: string;
    license: string;
    repository?: string;
}

const contributors: Contributor[] = contributorsJson;
const dependencies: Dependency[] = dependenciesJson;

// remove specific version from dependency list
const dependencyRegex = /(@?.*)@.*/g;

const About: React.FC = () => {
    const { t } = useTranslation();

    const renderContributor = (contributor: Contributor) => (
        <Grid
            item
            md={4}
            xs={12}
        >
            <Card>
                <CardActionArea
                    component="a"
                    href={contributor.html_url}
                    target="_blank"
                >
                    <CardContent sx={{ alignItems: "center", display: "flex", gap: 2 }}>
                        <Box>
                            <Avatar
                                src={contributor.avatar_url}
                                sx={{ height: 64, width: 64 }}
                            />
                        </Box>
                        <Typography
                            component="div"
                            variant="h5"
                        >
                            {`${contributor.login}`}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    );

    const renderDependency = (dependency: Dependency) => (
        <Grid
            item
            md={6}
            xs={12}
        >
            <Card>
                <CardActionArea
                    component="a"
                    disabled={!dependency.repository}
                    href={dependency.repository ? dependency.repository : undefined}
                    target="_blank"
                >
                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography
                            component="div"
                            variant="h6"
                        >
                            {`${dependency.name.replace(dependencyRegex, "$1")}`}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            component="div"
                            variant="subtitle1"
                        >
                            {`${dependency.license}`}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 2 }}>
            <PageTitle title={t("pages.about.title")} />

            <Typography>
                <span
                    dangerouslySetInnerHTML={{
                        __html: t("pages.about.main-text"),
                    }}
                />
            </Typography>

            <Stack
                direction="row"
                spacing={2}
            >
                <Button
                    component="a"
                    href="https://github.com/atomicptr/dauntless-builder"
                    startIcon={<GitHub />}
                    target="_blank"
                >
                    {t("pages.about.source-code")}
                </Button>
            </Stack>

            <Typography
                component="div"
                variant="h4"
            >
                {t("pages.about.privacy")}
            </Typography>

            <Typography>{t("pages.about.privacy-text")}</Typography>

            <Typography
                component="div"
                variant="h4"
            >
                {t("pages.about.assets")}
            </Typography>

            <Typography>{t("pages.about.assets-text")}</Typography>

            <Typography
                component="div"
                variant="h4"
            >
                {t("pages.about.contributors")}
            </Typography>

            <Grid
                container
                spacing={2}
            >
                {contributors.map(renderContributor)}
            </Grid>

            <Typography
                component="div"
                variant="h4"
            >
                {t("pages.about.dependencies", { number: dependencies.length })}
            </Typography>

            <Grid
                container
                spacing={2}
            >
                {dependencies.map(renderDependency)}
            </Grid>
        </Box>
    );
};

export default About;
