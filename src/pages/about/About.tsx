import { Stack } from "@mui/material";
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

const About: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <h1>{t("pages.about.contributors")}</h1>
            {contributors.map(contributor => (
                <Stack
                    key={contributor.login}
                    direction="row"
                    spacing={2}
                >
                    <img
                        src={contributor.avatar_url}
                        style={{ height: "64px", width: "64px" }}
                    />
                    <h2>{contributor.login}</h2>
                </Stack>
            ))}

            <h1>{t("pages.about.dependencies")}</h1>
            {dependencies.map(dependency => (
                <h2 key={dependency.name}>{`${dependency.name} - ${dependency.license}`}</h2>
            ))}
        </>
    );
};

export default About;
