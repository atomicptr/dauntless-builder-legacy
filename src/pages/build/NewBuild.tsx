import React from "react";
import {useTranslation} from "react-i18next";
import {Typography} from "@mui/material";

const NewBuild: React.FC = () => {
    const {t} = useTranslation();
    return <Typography variant="h5" component="h3">
        {t("pages.newbuild.title")}
    </Typography>;
};

export default NewBuild;
