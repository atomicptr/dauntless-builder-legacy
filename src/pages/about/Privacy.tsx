import { Box, Typography } from "@mui/material";
import PageTitle from "@src/components/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

const Privacy: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 2 }}>
            <PageTitle title={t("pages.privacy.title")} />

            <Typography>Lorem ipsum dolor sit amet</Typography>

            <PageTitle title={t("pages.privacy.netlify")} />
            <PageTitle title={t("pages.privacy.cloudflare")} />
            <PageTitle title={t("pages.privacy.google-analytics")} />
            <PageTitle title={t("pages.privacy.playwire")} />
        </Box>
    );
};

export default Privacy;
