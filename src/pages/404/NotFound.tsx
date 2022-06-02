import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import PageTitle from "../../components/page-title/PageTitle";

const NotFound: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box>
            <PageTitle
                title={t("pages.404.not-found")} />
            <Box
                sx={{ bottom: 0, position: "absolute", right: 0 }}>
                <img
                    alt="Sad hoots"
                    src="/assets/sadhoots.png"
                    style={{ maxWidth: "70%" }} />
            </Box>
        </Box>
    );
};

export default NotFound;
