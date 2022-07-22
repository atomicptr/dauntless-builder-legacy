import { Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

interface PageTitleProps {
    title: string;
    hidden?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, hidden }) => {
    const { t } = useTranslation();

    const metaDescription = "Create and share Dauntless builds with your friends!";

    return (
        <>
            <Helmet>
                <title>{`${title} | ${t("app-name")}`}</title>

                <meta
                    content="Dauntless Builder"
                    property="og:site_name"
                />
                <meta
                    content={title}
                    property="og:title"
                />
                <meta
                    content={metaDescription}
                    name="description"
                />
                <meta
                    content={metaDescription}
                    property="og:description"
                />
                <meta
                    content={"https://www.dauntless-builder.com/assets/icon.png"}
                    property="og:image"
                />
            </Helmet>

            {!hidden ? (
                <Typography
                    component="h1"
                    variant="h4"
                >
                    {title}
                </Typography>
            ) : null}
        </>
    );
};

export default React.memo(PageTitle);
