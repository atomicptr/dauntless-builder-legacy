import { Download } from "@mui/icons-material";
import { Alert, Box, Button, Card } from "@mui/material";
import { downloadJsonObject } from "@src/utils/download-json";
import log, { Logger } from "@src/utils/logger";
import React from "react";
import { FallbackProps } from "react-error-boundary/dist/declarations/src/types";
import { useTranslation } from "react-i18next";

const SomethingWentWrong = ({ error }: FallbackProps) => {
    const { t } = useTranslation();

    log.error(error.message);

    return (
        <Alert color="error">
            <Box>{t("misc.something-went-wrong")}</Box>
            <Card sx={{ mb: 2, mt: 2, p: 2 }}>{error.message}</Card>
            <Button
                color="primary"
                startIcon={<Download />}
                {...downloadJsonObject(Logger.data(), "dauntless-builder-logs")}
            >
                {t("pages.settings.export-logs")}
            </Button>
        </Alert>
    );
};

export default React.memo(SomethingWentWrong);
