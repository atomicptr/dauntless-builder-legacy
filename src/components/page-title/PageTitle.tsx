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

    return (
        <>
            <Helmet>
                <title>{`${title} | ${t("app-name")}`}</title>
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

export default PageTitle;
