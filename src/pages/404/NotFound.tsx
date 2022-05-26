import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const NotFound: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box>
            <Typography variant="h5" component="h3">
                {t("pages.404.not-found")}
            </Typography>
            <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
                <img alt="Sad hoots" src="/assets/sadhoots.png" style={{ maxWidth: "70%" }} />
            </Box>
        </Box>
    );
};

export default NotFound;
