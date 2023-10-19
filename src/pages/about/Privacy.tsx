import { Warning } from "@mui/icons-material";
import { Alert, Box, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import PageTitle from "@src/components/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

import privacyContent from "./privacy.html?raw";

const Privacy: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    const PrivacyPoliczWrapper = styled("div")`
        a {
            color: ${theme.palette.primary.main};
            text-decoration: none;
        }
    `;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 2 }}>
            <PageTitle title={t("pages.privacy.title-alt")} />

            <Alert
                color="warning"
                icon={<Warning />}
            >
                {t("misc.only-english")}
            </Alert>

            <PrivacyPoliczWrapper>
                <div dangerouslySetInnerHTML={{ __html: privacyContent }} />
            </PrivacyPoliczWrapper>
        </Box>
    );
};

export default Privacy;
