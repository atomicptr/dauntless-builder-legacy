import React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";

const MetaBuilds: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Typography variant="h5" component="h3">
            {t("pages.metabuilds.title")}
        </Typography>
    );
};

export default MetaBuilds;
