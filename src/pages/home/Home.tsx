import { Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import PageTitle from "../../components/page-title/PageTitle";

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <PageTitle title={t("pages.home.title")} />

            <Button component={NavLink} to={"/b/0VfrT2mCZCkBHjhjcjUaTVTvETbC8zH0RToCggUAVtVCRtjot6CndsmfxXTe"}>
                Test Build #1
            </Button>
        </>
    );
};

export default Home;
