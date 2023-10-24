import { Error, Warning } from "@mui/icons-material";
import { Alert } from "@mui/material";
import { BuildFlags } from "@src/data/BuildModel";
import { buildModelView } from "@src/state/build";
import { useAtomValue } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";

const BuildWarning = () => {
    const build = useAtomValue(buildModelView);
    const { t } = useTranslation();

    if (build.hasFlag(BuildFlags.UpgradedBuild)) {
        return (
            <Alert
                color="warning"
                icon={<Warning />}
            >
                {t("components.build-warning.upgraded-build")}
            </Alert>
        );
    }

    if (build.hasFlag(BuildFlags.InvalidBuild)) {
        return (
            <Alert
                color="error"
                icon={<Error />}
            >
                {t("components.build-warning.invalid-build")}
            </Alert>
        );
    }

    return null;
};

export default React.memo(BuildWarning);
